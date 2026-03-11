namespace Application.DTOs.Analytics;

public class ClaimsRatioDto
{
    public int TotalClaims { get; set; }
    public int Submitted { get; set; }
    public int UnderReview { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
    public int Settled { get; set; }
    public decimal ApprovalRate { get; set; }
    public decimal AverageSettlementAmount { get; set; }
}
