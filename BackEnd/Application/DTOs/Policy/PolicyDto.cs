namespace Application.DTOs.Policy;

public class PolicyDto
{
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public int QuoteId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int? AgentId { get; set; }
    public string? AgentName { get; set; }
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string TierName { get; set; } = string.Empty;
    public decimal PremiumAmount { get; set; }
    public decimal CoverageLimit { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool CanRenew { get; set; }
    public bool CanCancel { get; set; }
}
