using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class BusinessProfileRepository : IBusinessProfileRepository
{
    private readonly AppDbContext _context;

    public BusinessProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<BusinessProfile?> GetByUserIdAsync(int userId)
    {
        return await _context.BusinessProfiles
            .FirstOrDefaultAsync(b => b.UserId == userId);
    }

    public async Task<bool> ExistsByUserIdAsync(int userId)
    {
        return await _context.BusinessProfiles.AnyAsync(b => b.UserId == userId);
    }

    public async Task AddAsync(BusinessProfile profile)
    {
        await _context.BusinessProfiles.AddAsync(profile);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}