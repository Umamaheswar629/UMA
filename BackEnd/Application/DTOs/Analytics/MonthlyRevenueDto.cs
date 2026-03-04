namespace Application.DTOs.Analytics;

public class MonthlyRevenueDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int PolicyCount { get; set; }
}
