using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Quote;

public class QuoteRequest
{
    [Required]
    public int PlanId { get; set; }

    [Required]
    public int BusinessProfileId { get; set; }
}
