using Application.DTOs.Commission;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class CommissionRepository : ICommissionRepository
{
    private readonly AppDbContext _context;

    public CommissionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Policy?> GetPolicyWithPlanAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q.Plan)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<List<Commission>> GetByAgentIdWithDetailsAsync(int agentId)
    {
        return await _context.Commissions
            .Include(c => c.Agent)
            .Include(c => c.Policy)
                .ThenInclude(p => p.Quote).ThenInclude(q => q.Plan).ThenInclude(pl => pl.InsuranceType)
            .Include(c => c.Policy).ThenInclude(p => p.Customer)
            .Where(c => c.AgentId == agentId)
            .OrderByDescending(c => c.EarnedAt)
            .ToListAsync();
    }

    public async Task<(List<Commission> Commissions, int TotalCount)> GetCommissionsPagedAsync(
        int? agentId, int page, int pageSize)
    {
        var query = _context.Commissions
            .Include(c => c.Agent)
            .Include(c => c.Policy)
                .ThenInclude(p => p.Quote).ThenInclude(q => q.Plan).ThenInclude(pl => pl.InsuranceType)
            .Include(c => c.Policy).ThenInclude(p => p.Customer)
            .AsQueryable();

        if (agentId.HasValue)
            query = query.Where(c => c.AgentId == agentId.Value);

        var total = await query.CountAsync();
        var commissions = await query
            .OrderByDescending(c => c.EarnedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (commissions, total);
    }

    public async Task<List<AgentPerformanceDto>> GetAllAgentPerformanceAsync()
    {
        return await _context.Commissions
            .Include(c => c.Agent)
            .GroupBy(c => new { c.AgentId, c.Agent.FullName })
            .Select(g => new AgentPerformanceDto
            {
                AgentId = g.Key.AgentId,
                AgentName = g.Key.FullName,
                TotalPolicies = g.Count(),
                TotalCommission = g.Sum(c => c.CommissionAmount),
                AveragePremium = g.Any() ? g.Average(c => c.Policy.PremiumAmount) : 0
            })
            .OrderByDescending(a => a.TotalCommission)
            .ToListAsync();
    }

    public async Task AddAsync(Commission commission)
    {
        await _context.Commissions.AddAsync(commission);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}