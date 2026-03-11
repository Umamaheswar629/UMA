using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Insurance;

public class CreateBusinessProfileRequest
{
    [Required]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    public string IndustryType { get; set; } = string.Empty;

    [Required]
    public int YearsInOperation { get; set; }

    [Required]
    public int EmployeeCount { get; set; }

    [Required]
    public decimal AnnualRevenue { get; set; }

    [Required]
    public string Location { get; set; } = string.Empty;

    public bool HasSafetyCertification { get; set; }
    public string? SafetyCertificatePath { get; set; }
}