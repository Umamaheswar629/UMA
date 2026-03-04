using Application.DTOs.Common;
using Application.DTOs.Policy;
using Domain.Enmus;

namespace Application.Interfaces;

public interface IPolicyService
{
    Task<ApiResponse<PolicyDto>> CreatePolicyAsync(int userId, UserRole role, CreatePolicyRequest request);
    Task<ApiResponse<PolicyDetailDto>> GetPolicyByIdAsync(int id, int userId, UserRole role);
    Task<ApiResponse<PagedResult<PolicyDto>>> GetPoliciesAsync(PolicyListRequest request, int userId, UserRole role);
    Task<ApiResponse<PolicyDto>> RenewPolicyAsync(int userId, RenewPolicyRequest request);
    Task<ApiResponse<PolicyDto>> CancelPolicyAsync(int userId, UserRole role, CancelPolicyRequest request);
    Task<ApiResponse<PolicyDto>> ApprovePolicyAsync(int agentUserId, int policyId);
}
