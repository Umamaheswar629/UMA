namespace Application.DTOs.Quote;

public class RiskScoreDto
{
    public decimal Score { get; set; }
    public string Level { get; set; } = string.Empty;
    public string LevelName { get; set; } = string.Empty;
    public decimal Multiplier { get; set; }
    public Dictionary<string, decimal> Breakdown { get; set; } = new();
}

public class QuoteResponse
{
    public int QuoteId { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string TierName { get; set; } = string.Empty;
    public decimal BasePremium { get; set; }
    public RiskScoreDto RiskScore { get; set; } = new();
    public decimal FinalPremium { get; set; }
    public decimal CoverageLimit { get; set; }
    public List<string> Features { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public bool IsConverted { get; set; }
}
