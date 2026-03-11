using Application.DTOs.Common;
using Application.DTOs.Insurance;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class BusinessProfileController : BaseApiController
{
    private readonly IBusinessProfileService _service;
    private readonly IBusinessProfileRepository _repo;
    private readonly IWebHostEnvironment _env;

    public BusinessProfileController(IBusinessProfileService service, IBusinessProfileRepository repo, IWebHostEnvironment env)
    {
        _service = service;
        _repo = repo;
        _env = env;
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

    /// <summary>Upload safety certificate file</summary>
    [HttpPost("upload-certificate")]
    public async Task<IActionResult> UploadCertificate(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<string>.FailResponse("No file uploaded."));

        // Save to Uploads/SafetyCertificates/ in the backend root
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "Uploads", "SafetyCertificates");
        Directory.CreateDirectory(uploadsFolder);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"cert_{GetUserId()}_{DateTime.UtcNow:yyyyMMddHHmmss}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/Uploads/SafetyCertificates/{fileName}";

        // If profile already exists, update it directly
        var profile = await _repo.GetByUserIdAsync(GetUserId());
        if (profile != null)
        {
            profile.SafetyCertificatePath = relativePath;
            profile.HasSafetyCertification = true;
            await _repo.SaveChangesAsync();
        }

        return Ok(ApiResponse<string>.SuccessResponse(relativePath, "Certificate uploaded successfully."));
    }
}