namespace Application.DTOs.Insurance;

public class BusinessProfileDto
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string IndustryType { get; set; } = string.Empty;
    public int YearsInOperation { get; set; }
    public int EmployeeCount { get; set; }
    public decimal AnnualRevenue { get; set; }
    public string Location { get; set; } = string.Empty;
    public int PriorClaimsCount { get; set; }
}
