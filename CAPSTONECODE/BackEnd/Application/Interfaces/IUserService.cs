using Application.DTOs.Common;
using Application.DTOs.User;

namespace Application.Interfaces;

public interface IUserService
{
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(int userId);
    Task<ApiResponse<PagedResult<UserDto>>> GetAllUsersAsync(int page, int pageSize, string? role, string? search);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<UserDto>> UpdateUserRoleAsync(UpdateRoleRequest request);
    Task<ApiResponse<UserDto>> ToggleUserStatusAsync(int id);
}
