using Application.DTOs.Analytics;
using Application.Interfaces;
using Application.Services;
using Moq;

namespace Application.Tests.Services;

public class AnalyticsServiceTests
{
    private readonly Mock<IAnalyticsRepository> _analyticsRepoMock;
    private readonly AnalyticsService _analyticsService;

    public AnalyticsServiceTests()
    {
        _analyticsRepoMock = new Mock<IAnalyticsRepository>();
        _analyticsService = new AnalyticsService(_analyticsRepoMock.Object);
    }

    [Fact]
    public async Task GetAdminDashboardStatsAsync_ShouldReturnStats_Correctly()
    {
        // Arrange
        _analyticsRepoMock.Setup(r => r.GetTotalUsersAsync()).ReturnsAsync(100);
        _analyticsRepoMock.Setup(r => r.GetActivePoliciesAsync()).ReturnsAsync(50);
        _analyticsRepoMock.Setup(r => r.GetMonthlyRevenueAsync(It.IsAny<DateTime>())).ReturnsAsync(50000m);

        // Act
        var result = await _analyticsService.GetAdminDashboardStatsAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data.TotalUsers);
        Assert.Equal(50, result.Data.ActivePolicies);
        Assert.Equal(50000m, result.Data.MonthlyRevenue);
        
        _analyticsRepoMock.Verify(r => r.GetTotalUsersAsync(), Times.Once);
    }

    [Fact]
    public async Task GetPoliciesByTypeAsync_ShouldCalculatePercentages_Correctly()
    {
        // Arrange
        var data = new List<PoliciesByTypeDto>
        {
            new PoliciesByTypeDto { InsuranceTypeName = "Health", Count = 60, Percentage = 0 },
            new PoliciesByTypeDto { InsuranceTypeName = "Auto", Count = 40, Percentage = 0 }
        };
        
        _analyticsRepoMock.Setup(r => r.GetPoliciesByTypeAsync()).ReturnsAsync(data);

        // Act
        var result = await _analyticsService.GetPoliciesByTypeAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data.Count);
        
        // Assert percentages are calculated
        var healthStats = result.Data.First(p => p.InsuranceTypeName == "Health");
        var autoStats = result.Data.First(p => p.InsuranceTypeName == "Auto");
        
        Assert.Equal(60, healthStats.Percentage);
        Assert.Equal(40, autoStats.Percentage);
    }
}
