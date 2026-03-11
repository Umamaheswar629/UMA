using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    /// <summary>Get my notifications (paginated)</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetUserNotificationsAsync(GetUserId(), page, pageSize);
        return Ok(result);
    }

    /// <summary>Get unread notification count</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await _service.GetUnreadCountAsync(GetUserId());
        return Ok(result);
    }

    /// <summary>Mark single notification as read</summary>
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var result = await _service.MarkAsReadAsync(id, GetUserId());
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _service.MarkAllAsReadAsync(GetUserId());
        return Ok(new { success = true, message = "All notifications marked as read." });
    }
}