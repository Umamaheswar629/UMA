using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdWithProfileAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.BusinessProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<(IEnumerable<User> Users, int TotalCount)> GetAllWithPaginationAsync(
        int page, int pageSize, string? role, string? search)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
        {
            if (Enum.TryParse<Domain.Enmus.UserRole>(role, true, out var roleEnum))
                query = query.Where(u => u.Role == (int)roleEnum);
        }

        if (!string.IsNullOrEmpty(search))
            query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, total);
    }
}
