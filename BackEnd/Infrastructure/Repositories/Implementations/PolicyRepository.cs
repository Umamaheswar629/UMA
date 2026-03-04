using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class PolicyRepository : IPolicyRepository
{
    private readonly AppDbContext _context;

    public PolicyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Quote?> GetQuoteWithDetailsAsync(int quoteId)
    {
        return await _context.Quotes
            .Include(q => q.Plan).ThenInclude(p => p!.InsuranceType)
            .Include(q => q.BusinessProfile)
            .FirstOrDefaultAsync(q => q.Id == quoteId);
    }

    public async Task<User?> GetActiveAgentAsync(int agentId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == agentId && u.IsActive && u.Role == (int)UserRole.Agent);
    }

    public async Task<Policy?> GetByIdWithFullDetailsAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Customer)
            .Include(p => p.Agent)
            .Include(p => p.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .Include(p => p.Invoices)
            .Include(p => p.Claims)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<Policy?> GetByIdWithInvoicesAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Invoices)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<Policy?> GetByIdForRenewalAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q!.Plan)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<Plan?> GetActivePlanWithTypeAsync(int planId)
    {
        return await _context.Plans
            .Include(p => p.InsuranceType)
            .FirstOrDefaultAsync(p => p.Id == planId && p.IsActive);
    }

    public async Task<List<Policy>> GetExpiredActivePoliciesAsync()
    {
        return await _context.Policies
            .Where(p => p.Status == (int)PolicyStatus.Active && p.EndDate < DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<(List<Policy> Policies, int TotalCount)> GetPoliciesPagedAsync(
        int? customerId, int? agentId, PolicyStatus? status, int? insuranceTypeId,
        string? searchTerm, string? sortBy, string? sortDirection, int page, int pageSize)
    {
        var query = _context.Policies
            .Include(p => p.Customer)
            .Include(p => p.Agent)
            .Include(p => p.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .AsQueryable();

        if (customerId.HasValue) query = query.Where(p => p.CustomerId == customerId.Value);
        if (agentId.HasValue) query = query.Where(p => p.AgentId == agentId.Value);
        if (status.HasValue) query = query.Where(p => p.Status == (int)status.Value);
        if (insuranceTypeId.HasValue)
            query = query.Where(p => p.Quote != null && p.Quote.Plan != null && p.Quote.Plan.InsuranceTypeId == insuranceTypeId.Value);
        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(p => p.PolicyNumber.Contains(searchTerm) ||
                (p.Customer != null && p.Customer.FullName.Contains(searchTerm)));

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "premium" => sortDirection == "desc" ? query.OrderByDescending(p => p.PremiumAmount) : query.OrderBy(p => p.PremiumAmount),
            "startdate" => sortDirection == "desc" ? query.OrderByDescending(p => p.StartDate) : query.OrderBy(p => p.StartDate),
            "enddate" => sortDirection == "desc" ? query.OrderByDescending(p => p.EndDate) : query.OrderBy(p => p.EndDate),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var policies = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (policies, total);
    }

    public async Task AddPolicyAsync(Policy policy)
    {
        await _context.Policies.AddAsync(policy);
    }

    public async Task AddQuoteAsync(Quote quote)
    {
        await _context.Quotes.AddAsync(quote);
    }

    public async Task AddInvoiceAsync(Invoice invoice)
    {
        await _context.Invoices.AddAsync(invoice);
    }

    public async Task AddCommissionAsync(Commission commission)
    {
        await _context.Commissions.AddAsync(commission);
    }

    public async Task RemoveInvoiceAsync(Invoice invoice)
    {
        _context.Invoices.Remove(invoice);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
