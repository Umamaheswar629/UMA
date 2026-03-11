namespace Application.DTOs.Analytics;

public class AgentPerformanceDto
{
    public int AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public int TotalPolicies { get; set; }
    public decimal TotalCommission { get; set; }
    public decimal AveragePremium { get; set; }
}
