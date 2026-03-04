using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class AnalyticsController : BaseApiController
{
    private readonly IAnalyticsService _service;

    public AnalyticsController(IAnalyticsService service)
    {
        _service = service;
    }

    /// <summary>Admin dashboard KPIs</summary>
    [HttpGet("admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var result = await _service.GetAdminDashboardStatsAsync();
        return Ok(result);
    }

    /// <summary>Policies grouped by insurance type</summary>
    [HttpGet("policies-by-type")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPoliciesByType()
    {
        var result = await _service.GetPoliciesByTypeAsync();
        return Ok(result);
    }

    /// <summary>Monthly revenue trend</summary>
    [HttpGet("monthly-revenue")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetMonthlyRevenue([FromQuery] int months = 12)
    {
        var result = await _service.GetMonthlyRevenueAsync(months);
        return Ok(result);
    }

    /// <summary>Claims ratio breakdown</summary>
    [HttpGet("claims-ratio")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetClaimsRatio()
    {
        var result = await _service.GetClaimsRatioAsync();
        return Ok(result);
    }

    /// <summary>Agent performance leaderboard</summary>
    [HttpGet("agent-performance")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAgentPerformance()
    {
        var result = await _service.GetAgentPerformanceAsync();
        return Ok(result);
    }

    /// <summary>Plan tier distribution</summary>
    [HttpGet("plan-distribution")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPlanDistribution()
    {
        var result = await _service.GetPlanDistributionAsync();
        return Ok(result);
    }

    /// <summary>Customer dashboard</summary>
    [HttpGet("customer/dashboard")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetCustomerDashboard()
    {
        var result = await _service.GetCustomerDashboardAsync(GetUserId());
        return Ok(result);
    }
}