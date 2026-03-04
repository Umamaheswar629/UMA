using Application.DTOs.Insurance;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class InsuranceController : BaseApiController
{
    private readonly IInsuranceService _service;

    public InsuranceController(IInsuranceService service)
    {
        _service = service;
    }

    // ── Insurance Types ──────────────────────────────────────────────

    /// <summary>Get all insurance types</summary>
    [HttpGet("types")]
    public async Task<IActionResult> GetAllTypes([FromQuery] bool activeOnly = true)
    {
        var result = await _service.GetAllTypesAsync(activeOnly);
        return Ok(result);
    }

    /// <summary>Get insurance type by ID</summary>
    [HttpGet("types/{id}")]
    public async Task<IActionResult> GetTypeById(int id)
    {
        var result = await _service.GetTypeByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Create insurance type (Admin only)</summary>
    [HttpPost("types")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateType([FromBody] CreateInsuranceTypeRequest request)
    {
        var result = await _service.CreateInsuranceTypeAsync(request);
        return CreatedAtAction(nameof(GetTypeById), new { id = result.Data?.Id }, result);
    }

    /// <summary>Update insurance type (Admin only)</summary>
    [HttpPut("types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateType(int id, [FromBody] CreateInsuranceTypeRequest request)
    {
        var result = await _service.UpdateInsuranceTypeAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Toggle insurance type active/inactive (Admin only)</summary>
    [HttpPatch("types/{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleType(int id)
    {
        var result = await _service.ToggleInsuranceTypeStatusAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    // ── Plans ────────────────────────────────────────────────────────

    /// <summary>Get plans by insurance type</summary>
    [HttpGet("types/{insuranceTypeId}/plans")]
    public async Task<IActionResult> GetPlansByType(int insuranceTypeId)
    {
        var result = await _service.GetPlansByTypeAsync(insuranceTypeId);
        return Ok(result);
    }

    /// <summary>Get plan comparison (Basic / Standard / Premium)</summary>
    [HttpGet("types/{insuranceTypeId}/compare")]
    public async Task<IActionResult> ComparePlans(int insuranceTypeId)
    {
        var result = await _service.GetPlanComparisonAsync(insuranceTypeId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Create plan (Admin only)</summary>
    [HttpPost("plans")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePlan([FromBody] CreatePlanRequest request)
    {
        var result = await _service.CreatePlanAsync(request);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetPlansByType), new { insuranceTypeId = request.InsuranceTypeId }, result);
    }
}