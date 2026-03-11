using Application.DTOs.Billing;

namespace Application.DTOs.Policy;

public class ClaimSummaryDto
{
    public string ClaimNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime FiledAt { get; set; }
    public decimal? SettlementAmount { get; set; }
}

public class PolicyDetailDto : PolicyDto
{
    public List<string> Features { get; set; } = new();
    public List<InvoiceDto> Invoices { get; set; } = new();
    public List<ClaimSummaryDto> Claims { get; set; } = new();
}
