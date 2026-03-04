namespace Application.DTOs.Analytics;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalPolicies { get; set; }
    public int ActivePolicies { get; set; }
    public int TotalClaims { get; set; }
    public int OpenClaims { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public int TotalAgents { get; set; }
    public int NewUsersThisMonth { get; set; }
}
