namespace Application.DTOs.Commission;

public class CommissionSummaryDto
{
    public int AgentId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public decimal TotalCommissionEarned { get; set; }
    public decimal ThisMonthCommission { get; set; }
    public int TotalPoliciesCreated { get; set; }
    public decimal AveragePremium { get; set; }
    public List<CommissionDto> Commissions { get; set; } = new();
}
