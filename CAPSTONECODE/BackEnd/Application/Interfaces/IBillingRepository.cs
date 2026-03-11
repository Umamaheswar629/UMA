using Domain.Entities;


namespace Application.Interfaces;

public interface IBillingRepository
{
    Task<Policy?> GetPolicyByIdAsync(int policyId);
    Task<Policy?> GetPolicyWithInvoicesAsync(int policyId);
    Task<Invoice?> GetInvoiceByIdWithDetailsAsync(int invoiceId);
    Task<Invoice?> GetInvoiceWithPolicyAndPaymentsAsync(int invoiceId);
    Task<List<Invoice>> GetInvoicesByPolicyAsync(int policyId);
    Task<List<Invoice>> GetInvoicesByCustomerAsync(int userId);
    Task<List<Invoice>> GetOverdueInvoicesAsync();
    Task AddPaymentAsync(Payment payment);
    Task AddInvoicesAsync(IEnumerable<Invoice> invoices);
    Task RemoveInvoiceAsync(Invoice invoice);
    Task AddCommissionAsync(Commission commission);
    Task AddNotificationAsync(Notification notification);
    Task SaveChangesAsync();
}