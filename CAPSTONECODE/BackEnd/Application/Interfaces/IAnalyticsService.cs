using Application.DTOs.Analytics;
using Application.DTOs.Common;

namespace Application.Interfaces;

public interface IAnalyticsService
{
    Task<ApiResponse<DashboardStatsDto>> GetAdminDashboardStatsAsync();
    Task<ApiResponse<List<PoliciesByTypeDto>>> GetPoliciesByTypeAsync();
    Task<ApiResponse<List<MonthlyRevenueDto>>> GetMonthlyRevenueAsync(int months);
    Task<ApiResponse<ClaimsRatioDto>> GetClaimsRatioAsync();
    Task<ApiResponse<List<AgentPerformanceDto>>> GetAgentPerformanceAsync();
    Task<ApiResponse<List<PlanDistributionDto>>> GetPlanDistributionAsync();
    Task<ApiResponse<CustomerDashboardDto>> GetCustomerDashboardAsync(int userId);
}
