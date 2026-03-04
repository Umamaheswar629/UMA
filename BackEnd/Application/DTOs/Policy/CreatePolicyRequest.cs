using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Policy;

public class CreatePolicyRequest
{
    [Required]
    public int QuoteId { get; set; }

    public DateTime? StartDate { get; set; }

    public int? AgentId { get; set; }
}
