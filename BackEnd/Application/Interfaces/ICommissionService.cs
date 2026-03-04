using Application.DTOs.Commission;
using Application.DTOs.Common;
using Domain.Enmus;

namespace Application.Interfaces;

public interface ICommissionService
{
    Task<ApiResponse<CommissionSummaryDto>> GetAgentCommissionSummaryAsync(int agentId, int requesterId, UserRole role);
    Task<ApiResponse<PagedResult<CommissionDto>>> GetCommissionsAsync(int page, int pageSize, int userId, UserRole role);
    Task<ApiResponse<List<AgentPerformanceDto>>> GetAllAgentPerformanceAsync();
}
