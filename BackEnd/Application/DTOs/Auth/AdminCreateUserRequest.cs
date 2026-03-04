using System.ComponentModel.DataAnnotations;
using Domain.Enmus;


namespace Application.DTOs.Auth;

public class AdminCreateUserRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } // Agent or ClaimsOfficer only
}