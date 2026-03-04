using Domain.Entities;

namespace Domain.Tests.Entities;

public class ClaimTests
{
    [Fact]
    public void Claim_ShouldHaveDefaultValues_WhenInstantiated()
    {
        // Act
        var claim = new Claim();

        // Assert
        Assert.NotNull(claim.Documents);
        Assert.Empty(claim.Documents);
        Assert.Null(claim.SettledAt);
        Assert.Null(claim.SettlementAmount);
        Assert.Null(claim.OfficerNotes);
    }

    [Fact]
    public void Claim_ShouldAssignProperties_Properly()
    {
        // Arrange
        var incidentDate = DateTime.UtcNow.AddDays(-2);
        var filedDate = DateTime.UtcNow;

        // Act
        var claim = new Claim
        {
            Id = 1,
            ClaimNumber = "CLM-123",
            CustomerId = 5,
            PolicyId = 10,
            IncidentType = "Fire",
            IncidentDate = incidentDate,
            Description = "Warehouse fire",
            EstimatedAmount = 10000m,
            Status = 1,
            FiledAt = filedDate,
            OfficerId = 8
        };

        // Assert
        Assert.Equal(1, claim.Id);
        Assert.Equal("CLM-123", claim.ClaimNumber);
        Assert.Equal(5, claim.CustomerId);
        Assert.Equal(10, claim.PolicyId);
        Assert.Equal("Fire", claim.IncidentType);
        Assert.Equal(incidentDate, claim.IncidentDate);
        Assert.Equal("Warehouse fire", claim.Description);
        Assert.Equal(10000m, claim.EstimatedAmount);
        Assert.Equal(1, claim.Status);
        Assert.Equal(filedDate, claim.FiledAt);
        Assert.Equal(8, claim.OfficerId);
    }
}
