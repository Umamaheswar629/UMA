namespace Application.DTOs.Analytics;

public class PlanDistributionDto
{
    public string TierName { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}