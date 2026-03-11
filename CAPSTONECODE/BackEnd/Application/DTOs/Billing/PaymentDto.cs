namespace Application.DTOs.Billing;

public class PaymentDto
{
    public int PaymentId { get; set; }
    public int InvoiceId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionReference { get; set; } = string.Empty;
}
