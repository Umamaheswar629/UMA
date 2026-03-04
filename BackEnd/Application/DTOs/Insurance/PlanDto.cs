namespace Application.DTOs.Insurance;

public class PlanDto
{
    public int Id { get; set; }
    public int InsuranceTypeId { get; set; }
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string TierName { get; set; } = string.Empty;
    public decimal BasePremium { get; set; }
    public decimal CoverageLimit { get; set; }
    public decimal CommissionRate { get; set; }
    public List<string> Features { get; set; } = new();
    public List<string> Exclusions { get; set; } = new();
    public bool IsActive { get; set; }
}
