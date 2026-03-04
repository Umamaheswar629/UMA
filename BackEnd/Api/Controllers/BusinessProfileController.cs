using Application.DTOs.Insurance;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class BusinessProfileController : BaseApiController
{
    private readonly IBusinessProfileService _service;

    public BusinessProfileController(IBusinessProfileService service)
    {
        _service = service;
    }

    /// <summary>Get current user's business profile</summary>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _service.GetByUserIdAsync(GetUserId());
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Create business profile</summary>
    [HttpPost]
    public async Task<IActionResult> CreateProfile([FromBody] CreateBusinessProfileRequest request)
    {
        var result = await _service.CreateAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetProfile), result);
    }

    /// <summary>Update business profile</summary>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateBusinessProfileRequest request)
    {
        var result = await _service.UpdateAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}