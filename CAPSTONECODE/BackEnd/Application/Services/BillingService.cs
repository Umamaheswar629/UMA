using Application.DTOs.Billing;
using Application.DTOs.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;

namespace Application.Services;

public class BillingService : IBillingService
{
    private readonly IBillingRepository _billingRepo;

    public BillingService(IBillingRepository billingRepo)
    {
        _billingRepo = billingRepo;
    }

    public async Task<ApiResponse<BillingDashboardDto>> GetBillingDashboardAsync(int userId)
    {
        var invoices = await _billingRepo.GetInvoicesByCustomerAsync(userId);

        var pendingInvoices = invoices.Where(i => i.Status == (int)PaymentStatus.Pending).ToList();
        var overdueInvoices = invoices.Where(i => i.Status == (int)PaymentStatus.Overdue).ToList();

        var nextDue = pendingInvoices.OrderBy(i => i.DueDate).FirstOrDefault()
                      ?? overdueInvoices.OrderBy(i => i.DueDate).FirstOrDefault();

        var dashboard = new BillingDashboardDto
        {
            TotalPaid = invoices.Where(i => i.Status == (int)PaymentStatus.Paid).Sum(i => i.Amount),
            PendingAmount = pendingInvoices.Sum(i => i.Amount),
            OverdueAmount = overdueInvoices.Sum(i => i.Amount),
            NextDueDate = nextDue?.DueDate,
            NextDueAmount = nextDue?.Amount,
            RecentInvoices = invoices.OrderByDescending(i => i.DueDate).Take(10).Select(MapInvoiceToDto).ToList()
        };

        return ApiResponse<BillingDashboardDto>.SuccessResponse(dashboard);
    }

    public async Task<ApiResponse<List<InvoiceDto>>> GetInvoicesByPolicyAsync(int policyId, int userId, UserRole role)
    {
        var policy = await _billingRepo.GetPolicyByIdAsync(policyId);
        if (policy == null)
            return ApiResponse<List<InvoiceDto>>.FailResponse("Policy not found.");

        if (role == UserRole.Customer && policy.CustomerId != userId)
            return ApiResponse<List<InvoiceDto>>.FailResponse("Unauthorized.");

        var invoices = await _billingRepo.GetInvoicesByPolicyAsync(policyId);
        return ApiResponse<List<InvoiceDto>>.SuccessResponse(invoices.Select(MapInvoiceToDto).ToList());
    }

    public async Task<ApiResponse<InvoiceDto>> GetInvoiceByIdAsync(int id, int userId, UserRole role)
    {
        var invoice = await _billingRepo.GetInvoiceByIdWithDetailsAsync(id);
        if (invoice == null)
            return ApiResponse<InvoiceDto>.FailResponse("Invoice not found.");

        if (role == UserRole.Customer && invoice.Policy?.CustomerId != userId)
            return ApiResponse<InvoiceDto>.FailResponse("Unauthorized.");

        return ApiResponse<InvoiceDto>.SuccessResponse(MapInvoiceToDto(invoice));
    }

    public async Task<ApiResponse<PaymentDto>> RecordPaymentAsync(int userId, RecordPaymentRequest request)
    {
        var invoice = await _billingRepo.GetInvoiceWithPolicyAndPaymentsAsync(request.InvoiceId);
        if (invoice == null)
            return ApiResponse<PaymentDto>.FailResponse("Invoice not found.");

        if (invoice.Policy?.CustomerId != userId)
            return ApiResponse<PaymentDto>.FailResponse("Unauthorized.");

        if (invoice.Status == (int)PaymentStatus.Paid)
            return ApiResponse<PaymentDto>.FailResponse("Invoice already paid.");

        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            AmountPaid = request.AmountPaid,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = request.PaymentMethod,
            TransactionReference = request.TransactionReference
        };

        await _billingRepo.AddPaymentAsync(payment);

        // Check if fully paid
        var totalPaid = invoice.Payments.Sum(p => p.AmountPaid) + request.AmountPaid;
        if (totalPaid >= invoice.Amount)
        {
            invoice.Status = (int)PaymentStatus.Paid;
            invoice.PaidDate = DateTime.UtcNow;

            // If the policy was awaiting payment, activate it and create agent commission
            var policy = invoice.Policy;
            if (policy != null && policy.Status == (int)PolicyStatus.PaymentPending)
            {
                policy.Status = (int)PolicyStatus.Active;

                // Create commission for the agent
                if (policy.AgentId.HasValue)
                {
                    var commissionRate = 10.0m;
                    var commission = new Commission
                    {
                        AgentId = policy.AgentId.Value,
                        PolicyId = policy.Id,
                        CommissionRate = commissionRate,
                        CommissionAmount = policy.PremiumAmount * (commissionRate / 100m),
                        EarnedAt = DateTime.UtcNow
                    };
                    await _billingRepo.AddCommissionAsync(commission);

                    // Notify agent about commission earned
                    var agentNotification = new Notification
                    {
                        UserId = policy.AgentId.Value,
                        Title = "Commission Earned",
                        Message = $"You earned a commission of ₹{commission.CommissionAmount:N2} for policy {policy.PolicyNumber}.",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _billingRepo.AddNotificationAsync(agentNotification);
                }

                // Notify customer that policy is now active
                var customerNotification = new Notification
                {
                    UserId = policy.CustomerId,
                    Title = "Policy Activated",
                    Message = $"Your payment has been received. Policy {policy.PolicyNumber} is now active.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _billingRepo.AddNotificationAsync(customerNotification);
            }
        }

        await _billingRepo.SaveChangesAsync();

        return ApiResponse<PaymentDto>.SuccessResponse(new PaymentDto
        {
            PaymentId = payment.Id,
            InvoiceId = payment.InvoiceId,
            AmountPaid = payment.AmountPaid,
            PaymentDate = payment.PaymentDate,
            PaymentMethod = payment.PaymentMethod,
            TransactionReference = payment.TransactionReference
        }, "Payment recorded.");
    }

    public async Task<ApiResponse<List<InvoiceDto>>> GenerateEmiScheduleAsync(int userId, GenerateEmiRequest request)
    {
        var policy = await _billingRepo.GetPolicyWithInvoicesAsync(request.PolicyId);
        if (policy == null)
            return ApiResponse<List<InvoiceDto>>.FailResponse("Policy not found.");

        if (policy.CustomerId != userId)
            return ApiResponse<List<InvoiceDto>>.FailResponse("Unauthorized.");

        // Remove existing pending non-EMI invoices
        var pendingInvoices = policy.Invoices
            .Where(i => i.Status == (int)PaymentStatus.Pending && !i.IsEmi).ToList();
        foreach (var inv in pendingInvoices)
        {
            await _billingRepo.RemoveInvoiceAsync(inv);
        }

        // Generate EMI invoices
        var emiAmount = Math.Round(policy.PremiumAmount / request.NumberOfMonths, 2);
        var emiInvoices = new List<Invoice>();

        for (int i = 1; i <= request.NumberOfMonths; i++)
        {
            emiInvoices.Add(new Invoice
            {
                InvoiceNumber = $"EMI-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}-{i}",
                PolicyId = policy.Id,
                Amount = i == request.NumberOfMonths
                    ? policy.PremiumAmount - emiAmount * (request.NumberOfMonths - 1)
                    : emiAmount,
                DueDate = DateTime.UtcNow.AddMonths(i - 1).AddDays(30),
                Status = (int)PaymentStatus.Pending,
                IsEmi = true,
                EmiMonth = i,
                TotalEmiMonths = request.NumberOfMonths
            });
        }

        await _billingRepo.AddInvoicesAsync(emiInvoices);
        await _billingRepo.SaveChangesAsync();

        return ApiResponse<List<InvoiceDto>>.SuccessResponse(
            emiInvoices.Select(MapInvoiceToDto).ToList(),
            "EMI schedule generated.");
    }

    private static InvoiceDto MapInvoiceToDto(Invoice inv) => new()
    {
        InvoiceId = inv.Id,
        InvoiceNumber = inv.InvoiceNumber,
        PolicyId = inv.PolicyId,
        PolicyNumber = inv.Policy?.PolicyNumber ?? "",
        Amount = inv.Amount,
        DueDate = inv.DueDate,
        Status = ((PaymentStatus)inv.Status).ToString(),
        PaidDate = inv.PaidDate,
        IsEmi = inv.IsEmi,
        EmiMonth = inv.EmiMonth,
        TotalEmiMonths = inv.TotalEmiMonths,
        Payments = inv.Payments?.Select(p => new PaymentDto
        {
            PaymentId = p.Id,
            InvoiceId = p.InvoiceId,
            AmountPaid = p.AmountPaid,
            PaymentDate = p.PaymentDate,
            PaymentMethod = p.PaymentMethod,
            TransactionReference = p.TransactionReference
        }).ToList() ?? new()
    };
}
