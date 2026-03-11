using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Tests.Repositories;

public class GenericRepositoryTests
{
    private readonly AppDbContext _context;
    private readonly GenericRepository<Plan> _repository;

    public GenericRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
            .Options;

        _context = new AppDbContext(options);
        _repository = new GenericRepository<Plan>(_context);
    }

    [Fact]
    public async Task AddAsync_ShouldSaveEntity_ToDatabase()
    {
        // Arrange
        var plan = new Plan { TierName = "Basic Plan", BasePremium = 500m };

        // Act
        await _repository.AddAsync(plan);

        // Assert
        var savedPlan = await _context.Plans.FirstOrDefaultAsync(p => p.TierName == "Basic Plan");
        Assert.NotNull(savedPlan);
        Assert.Equal(500m, savedPlan.BasePremium);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnEntity_WhenExists()
    {
        // Arrange
        var plan = new Plan { TierName = "Premium Plan", BasePremium = 1000m };
        await _context.Plans.AddAsync(plan);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(plan.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Premium Plan", result.TierName);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllEntities()
    {
        // Arrange
        await _context.Plans.AddAsync(new Plan { TierName = "Plan A" });
        await _context.Plans.AddAsync(new Plan { TierName = "Plan B" });
        await _context.Plans.AddAsync(new Plan { TierName = "Plan C" });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyEntity_InDatabase()
    {
        // Arrange
        var plan = new Plan { TierName = "Old Name" };
        await _context.Plans.AddAsync(plan);
        await _context.SaveChangesAsync();

        // Act
        plan.TierName = "New Name";
        await _repository.UpdateAsync(plan);

        // Assert
        var updatedPlan = await _context.Plans.FindAsync(plan.Id);
        Assert.NotNull(updatedPlan);
        Assert.Equal("New Name", updatedPlan.TierName);
    }
}
