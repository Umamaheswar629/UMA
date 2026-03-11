using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Claims;

public class AssignOfficerRequest
{
    [Required]
    public int ClaimId { get; set; }

    [Required]
    public int OfficerId { get; set; }
}
