using Application.DTOs.Auth;
using Application.DTOs.Common;

namespace Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<AuthResponse>> AdminCreateUserAsync(AdminCreateUserRequest request);
}
