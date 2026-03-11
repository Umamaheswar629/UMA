using Application.DTOs.Auth;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enmus;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Application.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _configMock = new Mock<IConfiguration>();

        // Setup mock config for JWT generation
        _configMock.Setup(x => x["Jwt:Key"]).Returns("MySuperSecretTestKeyThatIsAtLeast32Bytes!");
        _configMock.Setup(x => x["Jwt:Issuer"]).Returns("TestIssuer");
        _configMock.Setup(x => x["Jwt:Audience"]).Returns("TestAudience");

        _authService = new AuthService(_userRepoMock.Object, _configMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldFail_WhenEmailExists()
    {
        // Arrange
        var request = new RegisterRequest { Email = "existing@test.com", Password = "Password123", FullName = "Test User" };
        _userRepoMock.Setup(repo => repo.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Email already registered.", result.Message);
        _userRepoMock.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_ShouldSucceed_WhenValid()
    {
        // Arrange
        var request = new RegisterRequest { Email = "new@test.com", Password = "Password123", FullName = "New User", Role = 1 };
        _userRepoMock.Setup(repo => repo.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);
        _userRepoMock.Setup(repo => repo.AddAsync(It.IsAny<User>())).ReturnsAsync(new User());

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Registration successful.", result.Message);
        Assert.NotNull(result.Data);
        Assert.Equal("new@test.com", result.Data.Email);
        Assert.Equal(UserRole.Customer.ToString(), result.Data.Role);
        _userRepoMock.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_ShouldFail_WhenUserNotFound()
    {
        // Arrange
        var request = new LoginRequest { Email = "notfound@test.com", Password = "Password123" };
        _userRepoMock.Setup(repo => repo.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid email or password.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldFail_WhenPasswordIncorrect()
    {
        // Arrange
        var request = new LoginRequest { Email = "test@test.com", Password = "WrongPassword" };
        var user = new User { Email = "test@test.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword") };
        _userRepoMock.Setup(repo => repo.GetByEmailAsync(request.Email)).ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid email or password.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldSucceed_WhenCredentialsValid()
    {
        // Arrange
        var request = new LoginRequest { Email = "test@test.com", Password = "CorrectPassword" };
        var user = new User 
        { 
            Id = 1,
            Email = "test@test.com", 
            FullName = "Test User",
            Role = (int)UserRole.Admin,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword") 
        };
        _userRepoMock.Setup(repo => repo.GetByEmailAsync(request.Email)).ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("test@test.com", result.Data.Email);
        Assert.Equal(UserRole.Admin.ToString(), result.Data.Role);
        Assert.NotNull(result.Data.Token);
    }
}
