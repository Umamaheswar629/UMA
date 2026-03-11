using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Tests.Repositories;

public class UserRepositoryTests
{
    private readonly AppDbContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
            .Options;

        _context = new AppDbContext(options);
        _repository = new UserRepository(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldSaveUser_ToDatabase()
    {
        // Arrange
        var user = new User { Email = "test@example.com", FullName = "Test User" };

        // Act
        await _repository.AddAsync(user);

        // Assert
        var savedUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(savedUser);
        Assert.Equal("Test User", savedUser.FullName);
    }

    [Fact]
    public async Task GetByEmailAsync_ShouldReturnUser_WhenExists()
    {
        // Arrange
        var user = new User { Email = "existing@example.com", FullName = "Existing User" };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByEmailAsync("existing@example.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("existing@example.com", result.Email);
    }

    [Fact]
    public async Task GetByEmailAsync_ShouldReturnNull_WhenNotExists()
    {
        // Arrange
        var user = new User { Email = "existing@example.com", FullName = "Existing User" };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByEmailAsync("missing@example.com");

        // Assert
        Assert.Null(result);
    }
}
