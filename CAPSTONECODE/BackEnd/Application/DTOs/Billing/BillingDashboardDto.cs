namespace Application.DTOs.Billing;

public class BillingDashboardDto
{
    public decimal TotalPaid { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal OverdueAmount { get; set; }
    public DateTime? NextDueDate { get; set; }
    public decimal? NextDueAmount { get; set; }
    public List<InvoiceDto> RecentInvoices { get; set; } = new();
}