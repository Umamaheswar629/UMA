namespace Application.DTOs.Analytics;

public class PoliciesByTypeDto
{
    public string InsuranceTypeName { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}