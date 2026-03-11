using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class QuoteRepository : IQuoteRepository
{
    private readonly AppDbContext _context;

    public QuoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<BusinessProfile?> GetBusinessProfileAsync(int profileId, int userId)
    {
        return await _context.BusinessProfiles
            .FirstOrDefaultAsync(b => b.Id == profileId && b.UserId == userId);
    }

    public async Task<Plan?> GetActivePlanWithTypeAsync(int planId)
    {
        return await _context.Plans
            .Include(p => p.InsuranceType)
            .FirstOrDefaultAsync(p => p.Id == planId && p.IsActive);
    }

    public async Task<Quote?> GetByIdWithDetailsAsync(int quoteId)
    {
        return await _context.Quotes
            .Include(q => q.Plan).ThenInclude(p => p.InsuranceType)
            .Include(q => q.BusinessProfile)
            .FirstOrDefaultAsync(q => q.Id == quoteId);
    }

    public async Task<List<Quote>> GetByUserIdWithDetailsAsync(int userId)
    {
        return await _context.Quotes
            .Include(q => q.Plan).ThenInclude(p => p.InsuranceType)
            .Include(q => q.BusinessProfile)
            .Where(q => q.BusinessProfile.UserId == userId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Quote quote)
    {
        await _context.Quotes.AddAsync(quote);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}