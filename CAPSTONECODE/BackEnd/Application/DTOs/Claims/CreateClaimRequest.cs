using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Claims;

public class CreateClaimRequest
{
    [Required]
    public int PolicyId { get; set; }

    [Required]
    public string IncidentType { get; set; } = string.Empty;

    [Required]
    public DateTime IncidentDate { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public decimal EstimatedAmount { get; set; }
}
