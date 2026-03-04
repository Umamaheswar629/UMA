using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Policy
    {
        public int Id { get; set; }
        public string PolicyNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int QuoteId { get; set; }
        public int? AgentId { get; set; }
        public decimal PremiumAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        public User? Customer { get; set; }
        public Quote? Quote { get; set; }
        public User? Agent { get; set; }

        public Commission? Commission { get; set; }
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
