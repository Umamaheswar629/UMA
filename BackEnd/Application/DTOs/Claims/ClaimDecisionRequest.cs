using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Claims;

public class ClaimDecisionRequest
{
    [Required]
    public int ClaimId { get; set; }

    [Required]
    public string Decision { get; set; } = string.Empty; // Approved, Rejected

    public decimal? SettlementAmount { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
}
