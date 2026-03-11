using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class ClaimsRepository : IClaimsRepository
{
    private readonly AppDbContext _context;

    public ClaimsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Policy?> GetPolicyWithPlanAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Quote).ThenInclude(q => q!.Plan)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<Claim?> GetByIdWithFullDetailsAsync(int claimId)
    {
        return await _context.Claims
            .Include(c => c.Customer).ThenInclude(u => u!.BusinessProfile)
            .Include(c => c.Officer)
            .Include(c => c.Policy).ThenInclude(p => p!.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Id == claimId);
    }

    public async Task<(List<Claim> Claims, int TotalCount)> GetClaimsPagedAsync(
        int? customerId, int? officerId, ClaimStatus? status,
        string? searchTerm, DateTime? startDate, DateTime? endDate,
        int page, int pageSize)
    {
        var query = _context.Claims
            .Include(c => c.Customer).ThenInclude(u => u!.BusinessProfile)
            .Include(c => c.Officer)
            .Include(c => c.Policy).ThenInclude(p => p!.Quote).ThenInclude(q => q!.Plan).ThenInclude(pl => pl!.InsuranceType)
            .Include(c => c.Documents)
            .AsQueryable();

        if (customerId.HasValue) query = query.Where(c => c.CustomerId == customerId.Value);
        if (officerId.HasValue) query = query.Where(c => c.OfficerId == officerId.Value);
        if (status.HasValue) query = query.Where(c => c.Status == (int)status.Value);
        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(c => c.ClaimNumber.Contains(searchTerm) || c.Description.Contains(searchTerm));
        if (startDate.HasValue) query = query.Where(c => c.FiledAt >= startDate.Value);
        if (endDate.HasValue) query = query.Where(c => c.FiledAt <= endDate.Value);

        var total = await query.CountAsync();
        var claims = await query
            .OrderByDescending(c => c.FiledAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (claims, total);
    }

    public async Task<User?> GetLeastLoadedOfficerAsync()
    {
        return await _context.Users
            .Where(u => u.Role == (int)UserRole.ClaimsOfficer && u.IsActive)
            .OrderBy(u => u.OfficerClaims.Count(c =>
                c.Status == (int)ClaimStatus.Filed || c.Status == (int)ClaimStatus.UnderReview))
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetActiveOfficerAsync(int officerId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == officerId &&
                u.Role == (int)UserRole.ClaimsOfficer && u.IsActive);
    }

    public async Task AddClaimAsync(Claim claim)
    {
        await _context.Claims.AddAsync(claim);
    }

    public async Task AddDocumentAsync(ClaimDocument document)
    {
        await _context.ClaimDocuments.AddAsync(document);
    }

    public async Task<ClaimDocument?> GetDocumentAsync(int claimId, int documentId)
    {
        return await _context.ClaimDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && d.ClaimId == claimId);
    }

    public async Task AddNotificationAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
