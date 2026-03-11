using Domain.Entities;

namespace Application.Interfaces;

public interface IBusinessProfileRepository
{
    Task<BusinessProfile?> GetByUserIdAsync(int userId);
    Task<bool> ExistsByUserIdAsync(int userId);
    Task AddAsync(BusinessProfile profile);
    Task SaveChangesAsync();
}