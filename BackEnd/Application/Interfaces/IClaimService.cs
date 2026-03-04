using Application.DTOs.Claims;
using Application.DTOs.Common;
using Domain.Enmus;

namespace Application.Interfaces;

public interface IClaimService
{
    Task<ApiResponse<ClaimDto>> CreateClaimAsync(int userId, CreateClaimRequest request);
    Task<ApiResponse<ClaimDto>> GetClaimByIdAsync(int id, int userId, UserRole role);
    Task<ApiResponse<PagedResult<ClaimDto>>> GetClaimsAsync(ClaimListRequest request, int userId, UserRole role);
    Task<ApiResponse<ClaimDto>> AssignOfficerAsync(AssignOfficerRequest request);
    Task<ApiResponse<ClaimDto>> MakeDecisionAsync(int officerId, ClaimDecisionRequest request);
    Task SaveDocumentAsync(int claimId, Domain.Entities.ClaimDocument document);
    Task<Domain.Entities.ClaimDocument?> GetDocumentAsync(int claimId, int documentId);
}
