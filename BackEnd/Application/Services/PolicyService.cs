using Application.DTOs.Billing;
using Application.DTOs.Common;
using Application.DTOs.Policy;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;
using Application.DTOs.Notifications;

namespace Application.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _policyRepo;
    private readonly INotificationRepository _notificationRepo;

    public PolicyService(IPolicyRepository policyRepo, INotificationRepository notificationRepo)
    {
        _policyRepo = policyRepo;
        _notificationRepo = notificationRepo;
    }

    public async Task<ApiResponse<PolicyDto>> CreatePolicyAsync(int userId, UserRole role, CreatePolicyRequest request)
    {
        var quote = await _policyRepo.GetQuoteWithDetailsAsync(request.QuoteId);
        if (quote == null)
            return ApiResponse<PolicyDto>.FailResponse("Quote not found.");

        if (quote.IsConverted)
            return ApiResponse<PolicyDto>.FailResponse("Quote already converted to policy.");

        var plan = quote.Plan;
        if (plan == null)
            return ApiResponse<PolicyDto>.FailResponse("Plan not found for this quote.");

        // Validate agent if provided
        if (request.AgentId.HasValue)
        {
            var agent = await _policyRepo.GetActiveAgentAsync(request.AgentId.Value);
            if (agent == null)
                return ApiResponse<PolicyDto>.FailResponse("Agent not found or inactive.");
        }

        var startDate = request.StartDate ?? DateTime.UtcNow;

        var policy = new Policy
        {
            PolicyNumber = $"POL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = userId,
            QuoteId = quote.Id,
            AgentId = request.AgentId,
            PremiumAmount = quote.CalculatedPremium,
            StartDate = startDate,
            EndDate = startDate.AddYears(1),
            Status = (int)PolicyStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        await _policyRepo.AddPolicyAsync(policy);

        // Mark quote as converted
        quote.IsConverted = true;

        // Save policy and quote first to generate policy.Id
        await _policyRepo.SaveChangesAsync();

        // NOTE: Invoice and commission are NOT created here.
        // They will be created when an agent approves the policy.

        // Reload the full policy with navigation properties
        var fullPolicy = await _policyRepo.GetByIdWithFullDetailsAsync(policy.Id);
        var reloadedPlan = fullPolicy?.Quote?.Plan;

        return ApiResponse<PolicyDto>.SuccessResponse(MapPolicyToDto(fullPolicy ?? policy, reloadedPlan ?? plan), "Policy created and pending agent approval.");
    }

    public async Task<ApiResponse<PolicyDetailDto>> GetPolicyByIdAsync(int id, int userId, UserRole role)
    {
        var policy = await _policyRepo.GetByIdWithFullDetailsAsync(id);
        if (policy == null)
            return ApiResponse<PolicyDetailDto>.FailResponse("Policy not found.");

        // Access control
        if (role == UserRole.Customer && policy.CustomerId != userId)
            return ApiResponse<PolicyDetailDto>.FailResponse("Unauthorized.");
        if (role == UserRole.Agent && policy.AgentId != userId)
            return ApiResponse<PolicyDetailDto>.FailResponse("Unauthorized.");

        var plan = policy.Quote?.Plan;
        var status = (PolicyStatus)policy.Status;

        var detail = new PolicyDetailDto
        {
            PolicyId = policy.Id,
            PolicyNumber = policy.PolicyNumber,
            QuoteId = policy.QuoteId,
            CustomerId = policy.CustomerId,
            CustomerName = policy.Customer?.FullName ?? "",
            CustomerEmail = policy.Customer?.Email ?? "",
            AgentId = policy.AgentId,
            AgentName = policy.Agent?.FullName,
            InsuranceTypeName = plan?.InsuranceType?.Name ?? "",
            PlanName = plan?.TierName ?? "",
            TierName = plan?.TierName ?? "",
            PremiumAmount = policy.PremiumAmount,
            CoverageLimit = plan?.CoverageLimit ?? 0,
            StartDate = policy.StartDate,
            EndDate = policy.EndDate,
            Status = status.ToString(),
            CreatedAt = policy.CreatedAt,
            CanRenew = status == PolicyStatus.Expired || status == PolicyStatus.PendingRenewal,
            CanCancel = status == PolicyStatus.Active,
            Features = ParseFeatures(plan?.Features),
            Invoices = policy.Invoices?.Select(inv => new InvoiceDto
            {
                InvoiceId = inv.Id,
                InvoiceNumber = inv.InvoiceNumber,
                PolicyId = inv.PolicyId,
                PolicyNumber = policy.PolicyNumber,
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
            }).ToList() ?? new(),
            Claims = policy.Claims?.Select(c => new ClaimSummaryDto
            {
                ClaimNumber = c.ClaimNumber,
                Status = ((ClaimStatus)c.Status).ToString(),
                FiledAt = c.FiledAt,
                SettlementAmount = c.SettlementAmount
            }).ToList() ?? new()
        };

        return ApiResponse<PolicyDetailDto>.SuccessResponse(detail);
    }

    public async Task<ApiResponse<PagedResult<PolicyDto>>> GetPoliciesAsync(PolicyListRequest request, int userId, UserRole role)
    {
        int? customerId = role == UserRole.Customer ? userId : null;
        int? agentId = role == UserRole.Agent ? userId : null;

        PolicyStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<PolicyStatus>(request.Status, true, out var ps))
            status = ps;

        var (policies, totalCount) = await _policyRepo.GetPoliciesPagedAsync(
            customerId, agentId, status, request.InsuranceTypeId,
            request.Search, request.SortBy, request.SortDirection,
            request.Page, request.PageSize);

        var items = policies.Select(p => MapPolicyToDto(p, p.Quote?.Plan)).ToList();

        return ApiResponse<PagedResult<PolicyDto>>.SuccessResponse(new PagedResult<PolicyDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }

    public async Task<ApiResponse<PolicyDto>> RenewPolicyAsync(int userId, RenewPolicyRequest request)
    {
        var policy = await _policyRepo.GetByIdForRenewalAsync(request.PolicyId);
        if (policy == null)
            return ApiResponse<PolicyDto>.FailResponse("Policy not found.");

        if (policy.CustomerId != userId)
            return ApiResponse<PolicyDto>.FailResponse("Unauthorized.");

        if (policy.Status != (int)PolicyStatus.Expired && policy.Status != (int)PolicyStatus.PendingRenewal)
            return ApiResponse<PolicyDto>.FailResponse("Policy is not eligible for renewal.");

        // Clone the original quote for the renewal (Quote→Policy is 1:1 with unique index on QuoteId)
        var originalQuote = policy.Quote;
        var renewalQuote = new Quote
        {
            BusinessProfileId = originalQuote!.BusinessProfileId,
            PlanId = originalQuote.PlanId,
            CalculatedPremium = originalQuote.CalculatedPremium,
            RiskLevel = originalQuote.RiskLevel,
            RiskScore = originalQuote.RiskScore,
            RiskMultiplier = originalQuote.RiskMultiplier,
            IsConverted = true,
            CreatedAt = DateTime.UtcNow
        };

        await _policyRepo.AddQuoteAsync(renewalQuote);
        await _policyRepo.SaveChangesAsync(); // Save to get renewalQuote.Id

        // Create new policy
        var newPolicy = new Policy
        {
            PolicyNumber = $"POL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = policy.CustomerId,
            QuoteId = renewalQuote.Id,
            AgentId = policy.AgentId,
            PremiumAmount = policy.PremiumAmount,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(1),
            Status = (int)PolicyStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _policyRepo.AddPolicyAsync(newPolicy);

        // Mark old policy as expired
        policy.Status = (int)PolicyStatus.Expired;

        // Save policy first to generate its ID
        await _policyRepo.SaveChangesAsync();

        // Create invoice for the new policy with the real generated ID
        var invoice = new Invoice
        {
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            PolicyId = newPolicy.Id,
            Amount = newPolicy.PremiumAmount,
            DueDate = DateTime.UtcNow.AddDays(30),
            Status = (int)PaymentStatus.Pending,
            IsEmi = false
        };

        await _policyRepo.AddInvoiceAsync(invoice);
        await _policyRepo.SaveChangesAsync();

        // Reload the full policy with navigation properties for proper DTO mapping
        var fullPolicy = await _policyRepo.GetByIdWithFullDetailsAsync(newPolicy.Id);
        var reloadedPlan = fullPolicy?.Quote?.Plan;

        return ApiResponse<PolicyDto>.SuccessResponse(MapPolicyToDto(fullPolicy ?? newPolicy, reloadedPlan ?? originalQuote.Plan), "Policy renewed successfully.");
    }

    public async Task<ApiResponse<PolicyDto>> CancelPolicyAsync(int userId, UserRole role, CancelPolicyRequest request)
    {
        var policy = await _policyRepo.GetByIdWithInvoicesAsync(request.PolicyId);
        if (policy == null)
            return ApiResponse<PolicyDto>.FailResponse("Policy not found.");

        if (role == UserRole.Customer && policy.CustomerId != userId)
            return ApiResponse<PolicyDto>.FailResponse("Unauthorized.");

        if (policy.Status != (int)PolicyStatus.Active)
            return ApiResponse<PolicyDto>.FailResponse("Only active policies can be cancelled.");

        policy.Status = (int)PolicyStatus.Cancelled;
        policy.CancelledAt = DateTime.UtcNow;

        // Cancel pending invoices
        foreach (var inv in policy.Invoices.Where(i => i.Status == (int)PaymentStatus.Pending))
        {
            inv.Status = (int)PaymentStatus.Cancelled;
        }

        await _policyRepo.SaveChangesAsync();

        return ApiResponse<PolicyDto>.SuccessResponse(MapPolicyToDto(policy, policy.Quote?.Plan), "Policy cancelled successfully.");
    }

    public async Task<ApiResponse<PolicyDto>> ApprovePolicyAsync(int agentUserId, int policyId)
    {
        var policy = await _policyRepo.GetByIdWithFullDetailsAsync(policyId);
        if (policy == null)
            return ApiResponse<PolicyDto>.FailResponse("Policy not found.");

        if (policy.Status != (int)PolicyStatus.PendingApproval)
            return ApiResponse<PolicyDto>.FailResponse("Policy is not pending approval.");

        // Only the assigned agent (or any agent if none assigned) can approve
        if (policy.AgentId.HasValue && policy.AgentId.Value != agentUserId)
            return ApiResponse<PolicyDto>.FailResponse("You are not assigned to this policy.");

        // If no agent was assigned, assign the approving agent
        if (!policy.AgentId.HasValue)
            policy.AgentId = agentUserId;

        // Activate the policy
        policy.Status = (int)PolicyStatus.Active;

        // Create the invoice now
        var invoice = new Invoice
        {
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            PolicyId = policy.Id,
            Amount = policy.PremiumAmount,
            DueDate = policy.StartDate.AddDays(30),
            Status = (int)PaymentStatus.Pending,
            IsEmi = false
        };
        await _policyRepo.AddInvoiceAsync(invoice);

        // Create commission for the agent
        var commissionRate = 10.0m;
        var commission = new Commission
        {
            AgentId = policy.AgentId.Value,
            PolicyId = policy.Id,
            CommissionRate = commissionRate,
            CommissionAmount = policy.PremiumAmount * (commissionRate / 100m),
            EarnedAt = DateTime.UtcNow
        };
        await _policyRepo.AddCommissionAsync(commission);

        await _policyRepo.SaveChangesAsync();

        // Send notification to the customer
        var notification = new Notification
        {
            UserId = policy.CustomerId,
            Title = "Policy Approved",
            Message = $"Your policy {policy.PolicyNumber} has been approved by an agent and is now active.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();

        // Reload
        var fullPolicy = await _policyRepo.GetByIdWithFullDetailsAsync(policy.Id);
        var plan = fullPolicy?.Quote?.Plan;

        return ApiResponse<PolicyDto>.SuccessResponse(MapPolicyToDto(fullPolicy ?? policy, plan), "Policy approved and activated successfully.");
    }

    private static PolicyDto MapPolicyToDto(Policy p, Plan? plan)
    {
        var status = (PolicyStatus)p.Status;
        return new PolicyDto
        {
            PolicyId = p.Id,
            PolicyNumber = p.PolicyNumber,
            QuoteId = p.QuoteId,
            CustomerId = p.CustomerId,
            CustomerName = p.Customer?.FullName ?? "",
            CustomerEmail = p.Customer?.Email ?? "",
            AgentId = p.AgentId,
            AgentName = p.Agent?.FullName,
            InsuranceTypeName = plan?.InsuranceType?.Name ?? "",
            PlanName = plan?.TierName ?? "",
            TierName = plan?.TierName ?? "",
            PremiumAmount = p.PremiumAmount,
            CoverageLimit = plan?.CoverageLimit ?? 0,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = status.ToString(),
            CreatedAt = p.CreatedAt,
            CanRenew = status == PolicyStatus.Expired || status == PolicyStatus.PendingRenewal,
            CanCancel = status == PolicyStatus.Active
        };
    }

    private static List<string> ParseFeatures(string? features)
    {
        return InsuranceService.ParseJsonList(features);
    }
}
