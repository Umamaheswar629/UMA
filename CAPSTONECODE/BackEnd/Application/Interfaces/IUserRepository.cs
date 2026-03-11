using Domain.Entities;

namespace Application.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdWithProfileAsync(int userId);
    Task<(IEnumerable<User> Users, int TotalCount)> GetAllWithPaginationAsync(
        int page, int pageSize, string? role, string? search);
}