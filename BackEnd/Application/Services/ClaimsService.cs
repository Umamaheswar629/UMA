using Application.DTOs.Claims;
using Application.DTOs.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;

namespace Application.Services;

public class ClaimsService : IClaimService
{
    private readonly IClaimsRepository _repo;

    public ClaimsService(IClaimsRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<ClaimDto>> CreateClaimAsync(int userId, CreateClaimRequest request)
    {
        var policy = await _repo.GetPolicyWithPlanAsync(request.PolicyId);
        if (policy == null)
            return ApiResponse<ClaimDto>.FailResponse("Policy not found.");

        if (policy.CustomerId != userId)
            return ApiResponse<ClaimDto>.FailResponse("Unauthorized.");

        if (policy.Status != (int)PolicyStatus.Active)
            return ApiResponse<ClaimDto>.FailResponse("Claims can only be filed against active policies.");

        var officer = await _repo.GetLeastLoadedOfficerAsync();

        var claim = new Claim
        {
            ClaimNumber = $"CLM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = userId,
            PolicyId = request.PolicyId,
            IncidentType = request.IncidentType,
            IncidentDate = request.IncidentDate,
            Description = request.Description,
            EstimatedAmount = request.EstimatedAmount,
            Status = (int)ClaimStatus.Filed,
            FiledAt = DateTime.UtcNow,
            OfficerId = officer?.Id
        };

        await _repo.AddClaimAsync(claim);
        await _repo.SaveChangesAsync();

        return ApiResponse<ClaimDto>.SuccessResponse(MapToDto(claim), "Claim filed successfully.");
    }

    public async Task<ApiResponse<ClaimDto>> GetClaimByIdAsync(int id, int userId, UserRole role)
    {
        var claim = await _repo.GetByIdWithFullDetailsAsync(id);
        if (claim == null)
            return ApiResponse<ClaimDto>.FailResponse("Claim not found.");

        if (role == UserRole.Customer && claim.CustomerId != userId)
            return ApiResponse<ClaimDto>.FailResponse("Unauthorized.");
        if (role == UserRole.ClaimsOfficer && claim.OfficerId != userId)
            return ApiResponse<ClaimDto>.FailResponse("Unauthorized.");

        return ApiResponse<ClaimDto>.SuccessResponse(MapToDto(claim));
    }

    public async Task<ApiResponse<PagedResult<ClaimDto>>> GetClaimsAsync(ClaimListRequest request, int userId, UserRole role)
    {
        int? customerId = role == UserRole.Customer ? userId : null;
        int? officerId = role == UserRole.ClaimsOfficer ? userId : null;

        ClaimStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<ClaimStatus>(request.Status, true, out var cs))
            status = cs;

        var (claims, totalCount) = await _repo.GetClaimsPagedAsync(
            customerId, officerId, status,
            request.Search, request.StartDate, request.EndDate,
            request.Page, request.PageSize);

        var items = claims.Select(MapToDto).ToList();

        return ApiResponse<PagedResult<ClaimDto>>.SuccessResponse(new PagedResult<ClaimDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }

    public async Task<ApiResponse<ClaimDto>> AssignOfficerAsync(AssignOfficerRequest request)
    {
        var claim = await _repo.GetByIdWithFullDetailsAsync(request.ClaimId);
        if (claim == null)
            return ApiResponse<ClaimDto>.FailResponse("Claim not found.");

        var officer = await _repo.GetActiveOfficerAsync(request.OfficerId);
        if (officer == null)
            return ApiResponse<ClaimDto>.FailResponse("Officer not found or inactive.");

        claim.OfficerId = officer.Id;
        claim.Status = (int)ClaimStatus.UnderReview;
        claim.ReviewedAt = DateTime.UtcNow;

        await _repo.SaveChangesAsync();

        return ApiResponse<ClaimDto>.SuccessResponse(MapToDto(claim), "Officer assigned.");
    }

    public async Task<ApiResponse<ClaimDto>> MakeDecisionAsync(int officerId, ClaimDecisionRequest request)
    {
        var claim = await _repo.GetByIdWithFullDetailsAsync(request.ClaimId);
        if (claim == null)
            return ApiResponse<ClaimDto>.FailResponse("Claim not found.");

        if (claim.OfficerId != officerId)
            return ApiResponse<ClaimDto>.FailResponse("Unauthorized.");

        if (request.Decision.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            claim.Status = (int)ClaimStatus.Approved;
            claim.SettlementAmount = request.SettlementAmount;
            claim.SettledAt = DateTime.UtcNow;
        }
        else if (request.Decision.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            claim.Status = (int)ClaimStatus.Rejected;
            claim.RejectionReason = request.RejectionReason ?? request.Notes;
        }
        else
        {
            return ApiResponse<ClaimDto>.FailResponse("Invalid decision. Use 'Approved' or 'Rejected'.");
        }

        claim.OfficerNotes = request.Notes;

        // Create notification for the customer
        var notifTitle = request.Decision.Equals("Approved", StringComparison.OrdinalIgnoreCase)
            ? $"Claim {claim.ClaimNumber} Approved"
            : $"Claim {claim.ClaimNumber} Rejected";

        var notifMessage = request.Decision.Equals("Approved", StringComparison.OrdinalIgnoreCase)
            ? $"Your claim {claim.ClaimNumber} has been approved with a settlement of ₹{claim.SettlementAmount:N0}."
            : $"Your claim {claim.ClaimNumber} has been rejected. Reason: {claim.RejectionReason}";

        var notification = new Notification
        {
            UserId = claim.CustomerId,
            Title = notifTitle,
            Message = notifMessage,
            Type = "Claim",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddNotificationAsync(notification);
        await _repo.SaveChangesAsync();

        return ApiResponse<ClaimDto>.SuccessResponse(MapToDto(claim), $"Claim {request.Decision.ToLower()}.");
    }

    public async Task SaveDocumentAsync(int claimId, ClaimDocument document)
    {
        await _repo.AddDocumentAsync(document);
        await _repo.SaveChangesAsync();
    }

    public async Task<ClaimDocument?> GetDocumentAsync(int claimId, int documentId)
    {
        return await _repo.GetDocumentAsync(claimId, documentId);
    }

    private static ClaimDto MapToDto(Claim c) => new()
    {
        ClaimId = c.Id,
        ClaimNumber = c.ClaimNumber,
        PolicyId = c.PolicyId,
        PolicyNumber = c.Policy?.PolicyNumber ?? "",
        InsuranceTypeName = c.Policy?.Quote?.Plan?.InsuranceType?.Name ?? "",
        PlanName = c.Policy?.Quote?.Plan?.TierName ?? "",
        CustomerId = c.CustomerId,
        CustomerName = c.Customer?.FullName ?? "",
        CustomerEmail = c.Customer?.Email ?? "",
        OfficerId = c.OfficerId,
        OfficerName = c.Officer?.FullName,
        IncidentType = c.IncidentType,
        IncidentDate = c.IncidentDate,
        Description = c.Description,
        EstimatedAmount = c.EstimatedAmount,
        SettlementAmount = c.SettlementAmount,
        CoverageLimit = c.Policy?.Quote?.Plan?.CoverageLimit ?? 0,
        Status = ((ClaimStatus)c.Status).ToString(),
        RejectionReason = c.RejectionReason,
        OfficerNotes = c.OfficerNotes,
        FiledAt = c.FiledAt,
        ReviewedAt = c.ReviewedAt,
        SettledAt = c.SettledAt,
        Documents = c.Documents?.Select(d => new ClaimDocumentDto
        {
            DocumentId = d.Id,
            FileName = d.FileName,
            FileType = d.FileType,
            FileSizeKb = Math.Round(d.FileSizeBytes / 1024.0, 1),
            UploadedAt = d.UploadedAt,
            DownloadUrl = $"/api/claims/{c.Id}/documents/{d.Id}"
        }).ToList() ?? new()
    };
}
