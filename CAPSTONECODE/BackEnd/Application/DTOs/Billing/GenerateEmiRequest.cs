using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Billing;

public class GenerateEmiRequest
{
    [Required]
    public int PolicyId { get; set; }

    [Required]
    [Range(2, 12)]
    public int NumberOfMonths { get; set; }
}
