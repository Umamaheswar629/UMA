using Application.DTOs.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ClaimsController : BaseApiController
{
    private readonly IClaimService _service;
    private readonly IWebHostEnvironment _env;

    public ClaimsController(IClaimService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    /// <summary>Create a new claim</summary>
    [HttpPost]
    public async Task<IActionResult> CreateClaim([FromBody] CreateClaimRequest request)
    {
        var result = await _service.CreateClaimAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetClaimById), new { id = result.Data?.ClaimId }, result);
    }

    /// <summary>Get claims (paginated)</summary>
    [HttpGet]
    public async Task<IActionResult> GetClaims([FromQuery] ClaimListRequest request)
    {
        var result = await _service.GetClaimsAsync(request, GetUserId(), GetUserRole());
        return Ok(result);
    }

    /// <summary>Get claim by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetClaimById(int id)
    {
        var result = await _service.GetClaimByIdAsync(id, GetUserId(), GetUserRole());
        if (!result.Success) return result.Message == "Unauthorized."
            ? Forbid() : NotFound(result);
        return Ok(result);
    }

    /// <summary>Assign officer to claim (Admin only)</summary>
    [HttpPost("assign-officer")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignOfficer([FromBody] AssignOfficerRequest request)
    {
        var result = await _service.AssignOfficerAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Make decision on a claim (ClaimsOfficer only)</summary>
    [HttpPost("decision")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<IActionResult> MakeDecision([FromBody] ClaimDecisionRequest request)
    {
        var result = await _service.MakeDecisionAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Upload document for a claim</summary>
    [HttpPost("{claimId}/documents")]
    public async Task<IActionResult> UploadDocument(int claimId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var uploadDir = Path.Combine(_env.ContentRootPath, "Uploads");
        if (!Directory.Exists(uploadDir))
            Directory.CreateDirectory(uploadDir);

        var safeFileName = Path.GetFileName(file.FileName);
        var storedName = $"{claimId}_{Guid.NewGuid().ToString()[..8]}_{safeFileName}";
        var filePath = Path.Combine(uploadDir, storedName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create DB record so the document shows in claim details
        var document = new Domain.Entities.ClaimDocument
        {
            ClaimId = claimId,
            FileName = safeFileName,
            FilePath = filePath,
            FileType = file.ContentType ?? "application/octet-stream",
            FileSizeBytes = file.Length,
            UploadedAt = DateTime.UtcNow
        };

        await _service.SaveDocumentAsync(claimId, document);

        return Ok(new { success = true, message = "File uploaded successfully", data = new { documentId = document.Id, fileName = safeFileName } });
    }

    /// <summary>Download/view a claim document</summary>
    [HttpGet("{claimId}/documents/{documentId}")]
    public async Task<IActionResult> DownloadDocument(int claimId, int documentId)
    {
        var doc = await _service.GetDocumentAsync(claimId, documentId);
        if (doc == null)
            return NotFound(new { success = false, message = "Document not found." });

        if (!System.IO.File.Exists(doc.FilePath))
            return NotFound(new { success = false, message = "File not found on server." });

        var fileBytes = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
        return File(fileBytes, doc.FileType, doc.FileName);
    }
}
