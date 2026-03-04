using Application.DTOs.Commission;
using Application.DTOs.Common;
using Application.Interfaces;
using Domain.Enmus;

namespace Application.Services;

public class CommissionService : ICommissionService
{
    private readonly ICommissionRepository _repo;

    public CommissionService(ICommissionRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<CommissionSummaryDto>> GetAgentCommissionSummaryAsync(int agentId, int requesterId, UserRole role)
    {
        if (role == UserRole.Agent && agentId != requesterId)
            return ApiResponse<CommissionSummaryDto>.FailResponse("Unauthorized.");

        var agent = await _repo.GetUserByIdAsync(agentId);
        if (agent == null)
            return ApiResponse<CommissionSummaryDto>.FailResponse("Agent not found.");

        var commissions = await _repo.GetByAgentIdWithDetailsAsync(agentId);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        var summary = new CommissionSummaryDto
        {
            AgentId = agentId,
            AgentName = agent.FullName,
            TotalCommissionEarned = commissions.Sum(c => c.CommissionAmount),
            ThisMonthCommission = commissions.Where(c => c.EarnedAt >= monthStart).Sum(c => c.CommissionAmount),
            TotalPoliciesCreated = commissions.Count,
            AveragePremium = commissions.Any() ? commissions.Average(c => c.Policy?.PremiumAmount ?? 0) : 0,
            Commissions = commissions.OrderByDescending(c => c.EarnedAt).Take(10).Select(c => MapToDto(c, agent.FullName)).ToList()
        };

        return ApiResponse<CommissionSummaryDto>.SuccessResponse(summary);
    }

    public async Task<ApiResponse<PagedResult<CommissionDto>>> GetCommissionsAsync(int page, int pageSize, int userId, UserRole role)
    {
        int? agentId = role == UserRole.Agent ? userId : null;

        var (commissions, totalCount) = await _repo.GetCommissionsPagedAsync(agentId, page, pageSize);

        var items = commissions.Select(c => MapToDto(c, c.Agent?.FullName ?? "")).ToList();

        return ApiResponse<PagedResult<CommissionDto>>.SuccessResponse(new PagedResult<CommissionDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<List<AgentPerformanceDto>>> GetAllAgentPerformanceAsync()
    {
        var data = await _repo.GetAllAgentPerformanceAsync();
        return ApiResponse<List<AgentPerformanceDto>>.SuccessResponse(data);
    }

    private static CommissionDto MapToDto(Domain.Entities.Commission c, string agentName) => new()
    {
        CommissionId = c.Id,
        AgentId = c.AgentId,
        AgentName = agentName,
        PolicyId = c.PolicyId,
        PolicyNumber = c.Policy?.PolicyNumber ?? "",
        CustomerName = c.Policy?.Customer?.FullName ?? "",
        InsuranceTypeName = c.Policy?.Quote?.Plan?.InsuranceType?.Name ?? "",
        PlanName = c.Policy?.Quote?.Plan?.TierName ?? "",
        PremiumAmount = c.Policy?.PremiumAmount ?? 0,
        CommissionRate = c.CommissionRate,
        CommissionAmount = c.CommissionAmount,
        EarnedAt = c.EarnedAt
    };
}
