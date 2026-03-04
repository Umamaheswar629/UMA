using Application.DTOs.Policy;

namespace Application.DTOs.Analytics;

public class CustomerDashboardDto
{
    public int ActivePolicies { get; set; }
    public int TotalClaims { get; set; }
    public int OpenClaims { get; set; }
    public DateTime? NextRenewalDate { get; set; }
    public string? NextRenewalPolicyNumber { get; set; }
    public decimal TotalPremiumPaid { get; set; }
    public List<PolicyDto> PoliciesExpiringSoon { get; set; } = new();
}