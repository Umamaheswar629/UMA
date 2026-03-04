using Application.DTOs.Common;
using Application.DTOs.User;
using Application.Interfaces;
using Domain.Enmus;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;

    public UserService(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<UserDto>.FailResponse("User not found.");

        return ApiResponse<UserDto>.SuccessResponse(MapToDto(user));
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetAllUsersAsync(int page, int pageSize, string? role, string? search)
    {
        var (users, totalCount) = await _userRepo.GetAllWithPaginationAsync(page, pageSize, role, search);
        var result = new PagedResult<UserDto>
        {
            Items = users.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
        return ApiResponse<PagedResult<UserDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int id)
    {
        var user = await _userRepo.GetByIdWithProfileAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.FailResponse("User not found.");

        return ApiResponse<UserDto>.SuccessResponse(MapToDto(user));
    }

    public async Task<ApiResponse<UserDto>> UpdateUserRoleAsync(UpdateRoleRequest request)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            return ApiResponse<UserDto>.FailResponse("User not found.");

        if (!Enum.IsDefined(typeof(UserRole), request.NewRole))
            return ApiResponse<UserDto>.FailResponse("Invalid role.");

        user.Role = request.NewRole;
        await _userRepo.UpdateAsync(user);
        return ApiResponse<UserDto>.SuccessResponse(MapToDto(user), "Role updated.");
    }

    public async Task<ApiResponse<UserDto>> ToggleUserStatusAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.FailResponse("User not found.");

        user.IsActive = !user.IsActive;
        await _userRepo.UpdateAsync(user);
        return ApiResponse<UserDto>.SuccessResponse(MapToDto(user),
            user.IsActive ? "User activated." : "User deactivated.");
    }

    private static UserDto MapToDto(Domain.Entities.User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = ((UserRole)user.Role).ToString(),
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
