using Domain.Entities;
using Domain.Enmus;

namespace Domain.Tests.Entities;

public class PolicyTests
{
    [Fact]
    public void Policy_ShouldHaveDefaultValues_WhenInstantiated()
    {
        // Act
        var policy = new Policy();

        // Assert
        Assert.NotNull(policy.Claims);
        Assert.Empty(policy.Claims);
        Assert.NotNull(policy.Invoices);
        Assert.Empty(policy.Invoices);
        Assert.Null(policy.Customer);
        Assert.Null(policy.Agent);
        Assert.Null(policy.Quote);
    }

    [Fact]
    public void Policy_ShouldAssignProperties_Properly()
    {
        // Arrange
        var startDate = DateTime.UtcNow;
        var endDate = startDate.AddYears(1);

        // Act
        var policy = new Policy
        {
            Id = 1,
            PolicyNumber = "POL-123",
            CustomerId = 10,
            QuoteId = 20,
            AgentId = 30,
            PremiumAmount = 5000m,
            StartDate = startDate,
            EndDate = endDate,
            Status = (int)PolicyStatus.Active
        };

        // Assert
        Assert.Equal(1, policy.Id);
        Assert.Equal("POL-123", policy.PolicyNumber);
        Assert.Equal(10, policy.CustomerId);
        Assert.Equal(20, policy.QuoteId);
        Assert.Equal(30, policy.AgentId);
        Assert.Equal(5000m, policy.PremiumAmount);
        Assert.Equal(startDate, policy.StartDate);
        Assert.Equal(endDate, policy.EndDate);
        Assert.Equal((int)PolicyStatus.Active, policy.Status);
    }
}
