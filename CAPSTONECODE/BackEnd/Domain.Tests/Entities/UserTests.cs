using Domain.Entities;
using Domain.Enmus;

namespace Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_ShouldHaveDefaultValues_WhenInstantiated()
    {
        // Act
        var user = new User();

        // Assert
        Assert.True(user.IsActive);
        Assert.NotNull(user.AgentPolicies);
        Assert.Empty(user.AgentPolicies);
        Assert.NotNull(user.Policies);
        Assert.Empty(user.Policies);
        Assert.NotNull(user.Claims);
        Assert.Empty(user.Claims);
        Assert.NotNull(user.OfficerClaims);
        Assert.Empty(user.OfficerClaims);
        Assert.NotNull(user.Commissions);
        Assert.Empty(user.Commissions);
        Assert.NotNull(user.Notifications);
        Assert.Empty(user.Notifications);
    }

    [Fact]
    public void User_ShouldAssignProperties_Properly()
    {
        // Arrange
        var testDate = DateTime.UtcNow;

        // Act
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            FullName = "Test User",
            Role = (int)UserRole.Customer,
            CreatedAt = testDate,
            IsActive = false
        };

        // Assert
        Assert.Equal(1, user.Id);
        Assert.Equal("test@example.com", user.Email);
        Assert.Equal("Test User", user.FullName);
        Assert.Equal((int)UserRole.Customer, user.Role);
        Assert.Equal(testDate, user.CreatedAt);
        Assert.False(user.IsActive);
    }
}
