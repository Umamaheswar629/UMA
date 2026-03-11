using Application.DTOs.Analytics;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _context;

    public AnalyticsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetTotalUsersAsync()
        => await _context.Users.CountAsync();

    public async Task<int> GetTotalPoliciesAsync()
        => await _context.Policies.CountAsync();

    public async Task<int> GetActivePoliciesAsync()
        => await _context.Policies.CountAsync(p => p.Status == (int)PolicyStatus.Active);

    public async Task<int> GetTotalClaimsAsync()
        => await _context.Claims.CountAsync();

    public async Task<int> GetOpenClaimsAsync()
        => await _context.Claims.CountAsync(c =>
            c.Status == (int)ClaimStatus.Filed || c.Status == (int)ClaimStatus.UnderReview);

    public async Task<decimal> GetTotalRevenueAsync()
        => await _context.Payments.SumAsync(p => p.AmountPaid);

    public async Task<decimal> GetMonthlyRevenueAsync(DateTime monthStart)
        => await _context.Payments
            .Where(p => p.PaymentDate >= monthStart && p.PaymentDate < monthStart.AddMonths(1))
            .SumAsync(p => p.AmountPaid);

    public async Task<int> GetTotalAgentsAsync()
        => await _context.Users.CountAsync(u => u.Role == (int)UserRole.Agent);

    public async Task<int> GetNewUsersThisMonthAsync(DateTime monthStart)
        => await _context.Users.CountAsync(u => u.CreatedAt >= monthStart);

    public async Task<List<PoliciesByTypeDto>> GetPoliciesByTypeAsync()
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .Where(p => p.Quote != null && p.Quote.Plan != null && p.Quote.Plan.InsuranceType != null)
            .GroupBy(p => p.Quote!.Plan!.InsuranceType!.Name)
            .Select(g => new PoliciesByTypeDto
            {
                InsuranceTypeName = g.Key,
                Count = g.Count()
            })
            .ToListAsync();
    }

    public async Task<decimal> GetRevenueForPeriodAsync(DateTime start, DateTime end)
        => await _context.Payments
            .Where(p => p.PaymentDate >= start && p.PaymentDate < end)
            .SumAsync(p => p.AmountPaid);

    public async Task<int> GetPolicyCountForPeriodAsync(DateTime start, DateTime end)
        => await _context.Policies
            .CountAsync(p => p.CreatedAt >= start && p.CreatedAt < end);

    public async Task<List<Claim>> GetAllClaimsAsync()
        => await _context.Claims.ToListAsync();

    public async Task<List<AgentPerformanceDto>> GetAgentPerformanceAsync()
    {
        return await _context.Commissions
            .Include(c => c.Agent)
            .Include(c => c.Policy)
            .GroupBy(c => new { c.AgentId, c.Agent!.FullName })
            .Select(g => new AgentPerformanceDto
            {
                AgentId = g.Key.AgentId,
                AgentName = g.Key.FullName,
                TotalPolicies = g.Count(),
                TotalCommission = g.Sum(c => c.CommissionAmount),
                AveragePremium = g.Any() ? g.Average(c => c.Policy!.PremiumAmount) : 0
            })
            .OrderByDescending(a => a.TotalCommission)
            .ToListAsync();
    }

    public async Task<List<PlanDistributionDto>> GetPlanDistributionAsync(int totalPolicies)
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q!.Plan)
            .Where(p => p.Quote != null && p.Quote.Plan != null)
            .GroupBy(p => p.Quote!.Plan!.TierName)
            .Select(g => new PlanDistributionDto
            {
                TierName = g.Key,
                Count = g.Count(),
                Percentage = totalPolicies > 0 ? Math.Round((decimal)g.Count() / totalPolicies * 100, 2) : 0
            })
            .ToListAsync();
    }

    public async Task<List<Policy>> GetCustomerPoliciesWithDetailsAsync(int userId)
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .Where(p => p.CustomerId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<decimal> GetCustomerTotalPaidAsync(int userId)
    {
        return await _context.Invoices
            .Where(i => i.Policy != null && i.Policy.CustomerId == userId && i.Status == (int)PaymentStatus.Paid)
            .SumAsync(i => i.Amount);
    }

    public async Task<int> GetCustomerTotalClaimsAsync(int userId)
        => await _context.Claims.CountAsync(c => c.CustomerId == userId);

    public async Task<int> GetCustomerOpenClaimsAsync(int userId)
        => await _context.Claims.CountAsync(c => c.CustomerId == userId &&
            (c.Status == (int)ClaimStatus.Filed || c.Status == (int)ClaimStatus.UnderReview));
}
