using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Insurance;

public class CreatePlanRequest
{
    [Required]
    public int InsuranceTypeId { get; set; }

    [Required]
    public string TierName { get; set; } = string.Empty;

    [Required]
    public decimal BasePremium { get; set; }

    [Required]
    public decimal CoverageLimit { get; set; }

    [Required]
    public decimal CommissionRate { get; set; }

    public List<string> Features { get; set; } = new();
    public List<string> Exclusions { get; set; } = new();
}