using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Billing;

public class RecordPaymentRequest
{
    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public decimal AmountPaid { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;

    public string TransactionReference { get; set; } = string.Empty;
}
