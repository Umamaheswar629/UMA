using System;

namespace Domain.Entities
{
    public class Commission
    {
        public int Id { get; set; }
        public int AgentId { get; set; }
        public int PolicyId { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal CommissionAmount { get; set; }
        public DateTime EarnedAt { get; set; }

        public User? Agent { get; set; }
        public Policy? Policy { get; set; }
    }
}
