using API.Controllers;
using Application.DTOs.Analytics;
using Application.DTOs.Common;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Api.Tests.Controllers;

public class AnalyticsControllerTests
{
    private readonly Mock<IAnalyticsService> _analyticsServiceMock;
    private readonly AnalyticsController _controller;

    public AnalyticsControllerTests()
    {
        _analyticsServiceMock = new Mock<IAnalyticsService>();
        _controller = new AnalyticsController(_analyticsServiceMock.Object);
    }

    [Fact]
    public async Task GetAdminDashboard_ShouldReturnOk_WithStats()
    {
        // Arrange
        var stats = new DashboardStatsDto { TotalUsers = 100 };
        var successResponse = ApiResponse<DashboardStatsDto>.SuccessResponse(stats);
        _analyticsServiceMock.Setup(s => s.GetAdminDashboardStatsAsync()).ReturnsAsync(successResponse);

        // Act
        var result = await _controller.GetAdminDashboard();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<DashboardStatsDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal(100, apiResponse.Data?.TotalUsers);
    }

    [Fact]
    public async Task GetPoliciesByType_ShouldReturnOk_WithData()
    {
        // Arrange
        var data = new List<PoliciesByTypeDto> { new PoliciesByTypeDto { InsuranceTypeName = "Health", Count = 5 } };
        var successResponse = ApiResponse<List<PoliciesByTypeDto>>.SuccessResponse(data);
        _analyticsServiceMock.Setup(s => s.GetPoliciesByTypeAsync()).ReturnsAsync(successResponse);

        // Act
        var result = await _controller.GetPoliciesByType();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<List<PoliciesByTypeDto>>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Single(apiResponse.Data!);
        Assert.Equal("Health", apiResponse.Data!.First().InsuranceTypeName);
    }
}
