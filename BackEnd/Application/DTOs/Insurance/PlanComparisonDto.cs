namespace Application.DTOs.Insurance;

public class PlanComparisonDto
{
    public int InsuranceTypeId { get; set; }
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlanDto? BasicPlan { get; set; }
    public PlanDto? StandardPlan { get; set; }
    public PlanDto? PremiumPlan { get; set; }
}
