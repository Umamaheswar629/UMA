using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class InsuranceRepository : IInsuranceRepository
{
    private readonly AppDbContext _context;

    public InsuranceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<InsuranceType>> GetAllTypesAsync(bool activeOnly)
    {
        var query = _context.InsuranceTypes
            .Include(t => t.Plans)
            .AsQueryable();

        if (activeOnly)
            query = query.Where(t => t.IsActive);

        return await query.OrderBy(t => t.Name).ToListAsync();
    }

    public async Task<InsuranceType?> GetTypeByIdWithPlansAsync(int id)
    {
        return await _context.InsuranceTypes
            .Include(t => t.Plans)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<InsuranceType?> GetTypeByIdAsync(int id)
    {
        return await _context.InsuranceTypes.FindAsync(id);
    }

    public async Task AddTypeAsync(InsuranceType type)
    {
        await _context.InsuranceTypes.AddAsync(type);
    }

    public async Task<List<Plan>> GetPlansByTypeAsync(int insuranceTypeId)
    {
        var plans = await _context.Plans
            .Include(p => p.InsuranceType)
            .Where(p => p.InsuranceTypeId == insuranceTypeId && p.IsActive)
            .ToListAsync();

        // Filter out plans with invalid BasePremium, then deduplicate by TierName
        var deduped = plans
            .Where(p => p.BasePremium > 0) // exclude bad data with ₹0 base
            .GroupBy(p => p.TierName, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderBy(p => p.Id).First()) // keep the original (oldest) valid plan
            .OrderBy(p => p.TierName.Equals("Basic", StringComparison.OrdinalIgnoreCase) ? 0 :
                          p.TierName.Equals("Standard", StringComparison.OrdinalIgnoreCase) ? 1 :
                          p.TierName.Equals("Premium", StringComparison.OrdinalIgnoreCase) ? 2 : 3)
            .ToList();

        return deduped;
    }

    public async Task AddPlanAsync(Plan plan)
    {
        await _context.Plans.AddAsync(plan);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}