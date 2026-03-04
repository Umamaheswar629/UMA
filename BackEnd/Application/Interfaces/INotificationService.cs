using Application.DTOs.Common;
using Application.DTOs.Notifications;

namespace Application.Interfaces;

public interface INotificationService
{
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId, int page, int pageSize);
    Task<ApiResponse<int>> GetUnreadCountAsync(int userId);
    Task<ApiResponse<NotificationDto>> MarkAsReadAsync(int id, int userId);
    Task MarkAllAsReadAsync(int userId);
}
