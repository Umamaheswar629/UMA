namespace Application.DTOs.Billing;

public class InvoiceDto
{
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidDate { get; set; }
    public bool IsEmi { get; set; }
    public int? EmiMonth { get; set; }
    public int? TotalEmiMonths { get; set; }
    public List<PaymentDto> Payments { get; set; } = new();
}
