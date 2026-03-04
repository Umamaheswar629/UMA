using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Policy;

public class CancelPolicyRequest
{
    [Required]
    public int PolicyId { get; set; }

    public string? Reason { get; set; }
}
