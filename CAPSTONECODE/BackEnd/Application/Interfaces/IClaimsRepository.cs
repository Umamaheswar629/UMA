using Domain.Enmus;
using Domain.Entities;

namespace Application.Interfaces;

public interface IClaimsRepository
{
    Task<Policy?> GetPolicyWithPlanAsync(int policyId);
    Task<Domain.Entities.Claim?> GetByIdWithFullDetailsAsync(int claimId);
    Task<(List<Domain.Entities.Claim> Claims, int TotalCount)> GetClaimsPagedAsync(
        int? customerId, int? officerId, ClaimStatus? status,
        string? searchTerm, DateTime? startDate, DateTime? endDate,
        int page, int pageSize);
    Task<User?> GetLeastLoadedOfficerAsync();
    Task<User?> GetActiveOfficerAsync(int officerId);
    Task AddClaimAsync(Domain.Entities.Claim claim);
    Task AddDocumentAsync(ClaimDocument document);
    Task<ClaimDocument?> GetDocumentAsync(int claimId, int documentId);
    Task AddNotificationAsync(Notification notification);
    Task SaveChangesAsync();
}