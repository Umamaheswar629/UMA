using Application.DTOs.Analytics;
using Application.DTOs.Commission;
using Domain.Entities;

namespace Application.Interfaces;

public interface IAnalyticsRepository
{
    // Admin dashboard counts
    Task<int> GetTotalUsersAsync();
    Task<int> GetTotalPoliciesAsync();
    Task<int> GetActivePoliciesAsync();
    Task<int> GetTotalClaimsAsync();
    Task<int> GetOpenClaimsAsync();
    Task<decimal> GetTotalRevenueAsync();
    Task<decimal> GetMonthlyRevenueAsync(DateTime monthStart);
    Task<int> GetTotalAgentsAsync();
    Task<int> GetNewUsersThisMonthAsync(DateTime monthStart);

    // Chart data
    Task<List<PoliciesByTypeDto>> GetPoliciesByTypeAsync();
    Task<decimal> GetRevenueForPeriodAsync(DateTime start, DateTime end);
    Task<int> GetPolicyCountForPeriodAsync(DateTime start, DateTime end);
    Task<List<Domain.Entities.Claim>> GetAllClaimsAsync();
    Task<List<Application.DTOs.Analytics.AgentPerformanceDto>> GetAgentPerformanceAsync();
    Task<List<PlanDistributionDto>> GetPlanDistributionAsync(int totalPolicies);

    // Customer dashboard
    Task<List<Policy>> GetCustomerPoliciesWithDetailsAsync(int userId);
    Task<decimal> GetCustomerTotalPaidAsync(int userId);
    Task<int> GetCustomerTotalClaimsAsync(int userId);
    Task<int> GetCustomerOpenClaimsAsync(int userId);
}