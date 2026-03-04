using Application.DTOs.Policy;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class PoliciesController : BaseApiController
{
    private readonly IPolicyService _service;

    public PoliciesController(IPolicyService service)
    {
        _service = service;
    }

    /// <summary>Create a policy from a quote</summary>
    [HttpPost]
    public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyRequest request)
    {
        try
        {
            var result = await _service.CreatePolicyAsync(GetUserId(), GetUserRole(), request);
            if (!result.Success) return BadRequest(result);
            return CreatedAtAction(nameof(GetPolicyById), new { id = result.Data?.PolicyId }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message, detail = ex.InnerException?.Message, stack = ex.StackTrace });
        }
    }

    /// <summary>Get policy details by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPolicyById(int id)
    {
        var result = await _service.GetPolicyByIdAsync(id, GetUserId(), GetUserRole());
        if (!result.Success) return result.Message == "Unauthorized."
            ? Forbid() : NotFound(result);
        return Ok(result);
    }

    /// <summary>Get policies (paginated, filtered, sorted)</summary>
    [HttpGet]
    public async Task<IActionResult> GetPolicies([FromQuery] PolicyListRequest request)
    {
        var result = await _service.GetPoliciesAsync(request, GetUserId(), GetUserRole());
        return Ok(result);
    }

    /// <summary>Renew a policy</summary>
    [HttpPost("renew")]
    public async Task<IActionResult> RenewPolicy([FromBody] RenewPolicyRequest request)
    {
        var result = await _service.RenewPolicyAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Cancel a policy</summary>
    [HttpPost("cancel")]
    public async Task<IActionResult> CancelPolicy([FromBody] CancelPolicyRequest request)
    {
        var result = await _service.CancelPolicyAsync(GetUserId(), GetUserRole(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Approve a pending policy (Agent/Admin only)</summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<IActionResult> ApprovePolicy(int id)
    {
        var result = await _service.ApprovePolicyAsync(GetUserId(), id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}