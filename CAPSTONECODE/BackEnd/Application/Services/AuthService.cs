using Application.DTOs.Auth;
using Application.DTOs.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config = config;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existing = await _userRepo.GetByEmailAsync(request.Email);
        if (existing != null)
            return ApiResponse<AuthResponse>.FailResponse("Email already registered.");

        Console.WriteLine($"[AUTH_DEBUG] RegisterAsync called. Email: {request.Email}, Role in Request: {request.Role}");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = (int)UserRole.Customer, // Force Customer for public registration
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user);

        var token = GenerateJwtToken(user);
        return ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = ((UserRole)user.Role).ToString()
        }, "Registration successful.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ApiResponse<AuthResponse>.FailResponse("Invalid email or password.");

        if (!user.IsActive)
            return ApiResponse<AuthResponse>.FailResponse("Account is deactivated.");

        var token = GenerateJwtToken(user);
        var authResponse = new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = ((UserRole)user.Role).ToString()
        };
        
        Console.WriteLine($"[DEBUG LOGIN] Emitting role: '{authResponse.Role}' for user '{authResponse.Email}'");
        
        return ApiResponse<AuthResponse>.SuccessResponse(authResponse);
    }

    public async Task<ApiResponse<AuthResponse>> AdminCreateUserAsync(AdminCreateUserRequest request)
    {
        var existing = await _userRepo.GetByEmailAsync(request.Email);
        if (existing != null)
            return ApiResponse<AuthResponse>.FailResponse("Email already registered.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = (int)request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user);

        return ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = ((UserRole)user.Role).ToString()
        }, "User created successfully.");
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? "SuperSecretKeyThatIsAtLeast32Characters!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new System.Security.Claims.Claim("userId", user.Id.ToString()),
            new System.Security.Claims.Claim(ClaimTypes.Email, user.Email),
            new System.Security.Claims.Claim(ClaimTypes.Name, user.FullName),
            new System.Security.Claims.Claim(ClaimTypes.Role, ((UserRole)user.Role).ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "CIPMS",
            audience: _config["Jwt:Audience"] ?? "CIPMS",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
