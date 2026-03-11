namespace Application.DTOs.Commission;

public class CommissionDto
{
    public int CommissionId { get; set; }
    public int AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public decimal PremiumAmount { get; set; }
    public decimal CommissionRate { get; set; }
    public decimal CommissionAmount { get; set; }
    public DateTime EarnedAt { get; set; }
}
