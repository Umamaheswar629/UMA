using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int PolicyId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public int Status { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool IsEmi { get; set; }
        public int? EmiMonth { get; set; }
        public int? TotalEmiMonths { get; set; }

        public Policy? Policy { get; set; }
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
