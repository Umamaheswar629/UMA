using API.Controllers;
using Application.DTOs.Auth;
using Application.DTOs.Common;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Api.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Register_ShouldReturnOk_WhenSuccessful()
    {
        // Arrange
        var request = new RegisterRequest { Email = "test@test.com" };
        var successResponse = ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse { Email = "test@test.com" });
        _authServiceMock.Setup(s => s.RegisterAsync(request)).ReturnsAsync(successResponse);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<AuthResponse>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal("test@test.com", apiResponse.Data?.Email);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenFails()
    {
        // Arrange
        var request = new RegisterRequest { Email = "test@test.com" };
        var failResponse = ApiResponse<AuthResponse>.FailResponse("Email already registered.");
        _authServiceMock.Setup(s => s.RegisterAsync(request)).ReturnsAsync(failResponse);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<AuthResponse>>(badRequestResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal("Email already registered.", apiResponse.Message);
    }

    [Fact]
    public async Task Login_ShouldReturnOk_WhenSuccessful()
    {
        // Arrange
        var request = new LoginRequest { Email = "test@test.com" };
        var successResponse = ApiResponse<AuthResponse>.SuccessResponse(new AuthResponse { Token = "test-token" });
        _authServiceMock.Setup(s => s.LoginAsync(request)).ReturnsAsync(successResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<AuthResponse>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal("test-token", apiResponse.Data?.Token);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenFails()
    {
        // Arrange
        var request = new LoginRequest { Email = "test@test.com" };
        var failResponse = ApiResponse<AuthResponse>.FailResponse("Invalid email or password.");
        _authServiceMock.Setup(s => s.LoginAsync(request)).ReturnsAsync(failResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<AuthResponse>>(unauthorizedResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal("Invalid email or password.", apiResponse.Message);
    }
}
