using Application.DTOs.Common;
using Application.DTOs.Notifications;
using Application.Interfaces;

namespace Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;

    public NotificationService(INotificationRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId, int page, int pageSize)
    {
        var notifications = await _repo.GetByUserIdPagedAsync(userId, page, pageSize);

        var items = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();

        return ApiResponse<List<NotificationDto>>.SuccessResponse(items);
    }

    public async Task<ApiResponse<int>> GetUnreadCountAsync(int userId)
    {
        var count = await _repo.GetUnreadCountAsync(userId);
        return ApiResponse<int>.SuccessResponse(count);
    }

    public async Task<ApiResponse<NotificationDto>> MarkAsReadAsync(int id, int userId)
    {
        var notification = await _repo.GetByIdAndUserAsync(id, userId);
        if (notification == null)
            return ApiResponse<NotificationDto>.FailResponse("Notification not found.");

        notification.IsRead = true;
        await _repo.SaveChangesAsync();

        return ApiResponse<NotificationDto>.SuccessResponse(new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        }, "Notification marked as read.");
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var unread = await _repo.GetUnreadByUserAsync(userId);
        foreach (var n in unread)
        {
            n.IsRead = true;
        }
        await _repo.SaveChangesAsync();
    }
}
