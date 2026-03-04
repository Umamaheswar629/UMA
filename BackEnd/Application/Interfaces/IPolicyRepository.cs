using Domain.Enmus;
using Domain.Entities;


namespace Application.Interfaces;

public interface IPolicyRepository
{
    Task<Quote?> GetQuoteWithDetailsAsync(int quoteId);
    Task<User?> GetActiveAgentAsync(int agentId);
    Task<Policy?> GetByIdWithFullDetailsAsync(int policyId);
    Task<Policy?> GetByIdWithInvoicesAsync(int policyId);
    Task<Policy?> GetByIdForRenewalAsync(int policyId);
    Task<Plan?> GetActivePlanWithTypeAsync(int planId);
    Task<List<Policy>> GetExpiredActivePoliciesAsync();
    Task<(List<Policy> Policies, int TotalCount)> GetPoliciesPagedAsync(
        int? customerId, int? agentId, PolicyStatus? status, int? insuranceTypeId,
        string? searchTerm, string? sortBy, string? sortDirection, int page, int pageSize);
    Task AddPolicyAsync(Policy policy);
    Task AddQuoteAsync(Quote quote);
    Task AddInvoiceAsync(Invoice invoice);
    Task AddCommissionAsync(Commission commission);
    Task RemoveInvoiceAsync(Invoice invoice);
    Task SaveChangesAsync();
}