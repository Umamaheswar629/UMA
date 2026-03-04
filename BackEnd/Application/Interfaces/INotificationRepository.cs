using Domain.Entities;

namespace Application.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task<List<Notification>> GetByUserIdPagedAsync(int userId, int page, int pageSize);
    Task<Notification?> GetByIdAndUserAsync(int notificationId, int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task<List<Notification>> GetUnreadByUserAsync(int userId);
    Task SaveChangesAsync();
}