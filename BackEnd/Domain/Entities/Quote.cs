using System;

namespace Domain.Entities
{
    public class Quote
    {
        public int Id { get; set; }
        public int BusinessProfileId { get; set; }
        public int PlanId { get; set; }
        public decimal CalculatedPremium { get; set; }
        public int RiskLevel { get; set; }
        public decimal RiskScore { get; set; }
        public decimal RiskMultiplier { get; set; }
        public bool IsConverted { get; set; }
        public DateTime CreatedAt { get; set; }

        public BusinessProfile? BusinessProfile { get; set; }
        public Plan? Plan { get; set; }
        public Policy? Policy { get; set; }
    }
}
