using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Policy;

public class RenewPolicyRequest
{
    [Required]
    public int PolicyId { get; set; }
}
