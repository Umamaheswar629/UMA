using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class CommissionsController : BaseApiController
{
    private readonly ICommissionService _service;

    public CommissionsController(ICommissionService service)
    {
        _service = service;
    }

    /// <summary>Get commission summary for an agent</summary>
    [HttpGet("agent/{agentId}/summary")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetAgentSummary(int agentId)
    {
        var result = await _service.GetAgentCommissionSummaryAsync(
            agentId, GetUserId(), GetUserRole());
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Get my commission summary (Agent shortcut)</summary>
    [HttpGet("my-summary")]
    [Authorize(Roles = "Agent")]
    public async Task<IActionResult> GetMySummary()
    {
        var userId = GetUserId();
        var result = await _service.GetAgentCommissionSummaryAsync(
            userId, userId, GetUserRole());
        return Ok(result);
    }

    /// <summary>Get commissions list (paginated)</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetCommissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.GetCommissionsAsync(
            page, pageSize, GetUserId(), GetUserRole());
        return Ok(result);
    }

    /// <summary>Get all agent performance leaderboard (Admin only)</summary>
    [HttpGet("performance")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPerformance()
    {
        var result = await _service.GetAllAgentPerformanceAsync();
        return Ok(result);
    }
}