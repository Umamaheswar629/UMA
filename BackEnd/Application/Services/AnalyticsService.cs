using Application.DTOs.Analytics;
using Application.DTOs.Common;
using Application.DTOs.Policy;
using Application.Interfaces;
using Domain.Enmus;

namespace Application.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _repo;

    public AnalyticsService(IAnalyticsRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetAdminDashboardStatsAsync()
    {
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var stats = new DashboardStatsDto
        {
            TotalUsers = await _repo.GetTotalUsersAsync(),
            TotalPolicies = await _repo.GetTotalPoliciesAsync(),
            ActivePolicies = await _repo.GetActivePoliciesAsync(),
            TotalClaims = await _repo.GetTotalClaimsAsync(),
            OpenClaims = await _repo.GetOpenClaimsAsync(),
            TotalRevenue = await _repo.GetTotalRevenueAsync(),
            MonthlyRevenue = await _repo.GetMonthlyRevenueAsync(monthStart),
            TotalAgents = await _repo.GetTotalAgentsAsync(),
            NewUsersThisMonth = await _repo.GetNewUsersThisMonthAsync(monthStart)
        };

        return ApiResponse<DashboardStatsDto>.SuccessResponse(stats);
    }

    public async Task<ApiResponse<List<PoliciesByTypeDto>>> GetPoliciesByTypeAsync()
    {
        var data = await _repo.GetPoliciesByTypeAsync();
        // Add percentage
        var total = data.Sum(d => d.Count);
        foreach (var item in data)
        {
            item.Percentage = total > 0 ? Math.Round((decimal)item.Count / total * 100, 2) : 0;
        }
        return ApiResponse<List<PoliciesByTypeDto>>.SuccessResponse(data);
    }

    public async Task<ApiResponse<List<MonthlyRevenueDto>>> GetMonthlyRevenueAsync(int months)
    {
        var result = new List<MonthlyRevenueDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var start = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-i);
            var end = start.AddMonths(1);
            var revenue = await _repo.GetRevenueForPeriodAsync(start, end);
            var policyCount = await _repo.GetPolicyCountForPeriodAsync(start, end);
            result.Add(new MonthlyRevenueDto
            {
                Month = start.ToString("MMM yyyy"),
                Revenue = revenue,
                PolicyCount = policyCount
            });
        }
        return ApiResponse<List<MonthlyRevenueDto>>.SuccessResponse(result);
    }

    public async Task<ApiResponse<ClaimsRatioDto>> GetClaimsRatioAsync()
    {
        var claims = await _repo.GetAllClaimsAsync();
        var total = claims.Count;

        var ratio = new ClaimsRatioDto
        {
            TotalClaims = total,
            Submitted = claims.Count(c => c.Status == (int)ClaimStatus.Filed),
            UnderReview = claims.Count(c => c.Status == (int)ClaimStatus.UnderReview),
            Approved = claims.Count(c => c.Status == (int)ClaimStatus.Approved),
            Rejected = claims.Count(c => c.Status == (int)ClaimStatus.Rejected),
            Settled = claims.Count(c => c.Status == (int)ClaimStatus.Settled),
            ApprovalRate = total > 0
                ? Math.Round((decimal)claims.Count(c => c.Status == (int)ClaimStatus.Approved || c.Status == (int)ClaimStatus.Settled) / total * 100, 2)
                : 0,
            AverageSettlementAmount = claims.Any(c => c.SettlementAmount.HasValue)
                ? Math.Round(claims.Where(c => c.SettlementAmount.HasValue).Average(c => c.SettlementAmount!.Value), 2)
                : 0
        };

        return ApiResponse<ClaimsRatioDto>.SuccessResponse(ratio);
    }

    public async Task<ApiResponse<List<AgentPerformanceDto>>> GetAgentPerformanceAsync()
    {
        var data = await _repo.GetAgentPerformanceAsync();
        return ApiResponse<List<AgentPerformanceDto>>.SuccessResponse(data);
    }

    public async Task<ApiResponse<List<PlanDistributionDto>>> GetPlanDistributionAsync()
    {
        var totalPolicies = await _repo.GetTotalPoliciesAsync();
        var data = await _repo.GetPlanDistributionAsync(totalPolicies);
        return ApiResponse<List<PlanDistributionDto>>.SuccessResponse(data);
    }

    public async Task<ApiResponse<CustomerDashboardDto>> GetCustomerDashboardAsync(int userId)
    {
        var policies = await _repo.GetCustomerPoliciesWithDetailsAsync(userId);
        var totalPaid = await _repo.GetCustomerTotalPaidAsync(userId);
        var totalClaims = await _repo.GetCustomerTotalClaimsAsync(userId);
        var openClaims = await _repo.GetCustomerOpenClaimsAsync(userId);

        var activePolicies = policies.Where(p => p.Status == (int)PolicyStatus.Active).ToList();
        var nextRenewal = activePolicies.OrderBy(p => p.EndDate).FirstOrDefault();
        var expiringSoon = activePolicies
            .Where(p => p.EndDate <= DateTime.UtcNow.AddDays(30))
            .Select(p => new PolicyDto
            {
                PolicyId = p.Id,
                PolicyNumber = p.PolicyNumber,
                InsuranceTypeName = p.Quote?.Plan?.InsuranceType?.Name ?? "",
                TierName = p.Quote?.Plan?.TierName ?? "",
                PremiumAmount = p.PremiumAmount,
                Status = ((PolicyStatus)p.Status).ToString(),
                StartDate = p.StartDate,
                EndDate = p.EndDate
            }).ToList();

        var dashboard = new CustomerDashboardDto
        {
            ActivePolicies = activePolicies.Count,
            TotalPremiumPaid = totalPaid,
            TotalClaims = totalClaims,
            OpenClaims = openClaims,
            NextRenewalDate = nextRenewal?.EndDate,
            NextRenewalPolicyNumber = nextRenewal?.PolicyNumber,
            PoliciesExpiringSoon = expiringSoon
        };

        return ApiResponse<CustomerDashboardDto>.SuccessResponse(dashboard);
    }
}
