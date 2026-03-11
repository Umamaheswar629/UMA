namespace Application.DTOs.Claims;

public class ClaimDto
{
    public int ClaimId { get; set; }
    public string ClaimNumber { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string InsuranceTypeName { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int? OfficerId { get; set; }
    public string? OfficerName { get; set; }
    public string IncidentType { get; set; } = string.Empty;
    public DateTime IncidentDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal EstimatedAmount { get; set; }
    public decimal? SettlementAmount { get; set; }
    public decimal CoverageLimit { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string? OfficerNotes { get; set; }
    public DateTime FiledAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime? SettledAt { get; set; }
    public List<ClaimDocumentDto> Documents { get; set; } = new();
}
