using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Plan
    {
        public int Id { get; set; }
        public int InsuranceTypeId { get; set; }
        public string TierName { get; set; } = string.Empty;
        public decimal BasePremium { get; set; }
        public decimal CoverageLimit { get; set; }
        public decimal CommissionRate { get; set; }
        public string Features { get; set; } = string.Empty;
        public string Exclusions { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public InsuranceType? InsuranceType { get; set; }
        public ICollection<Quote> Quotes { get; set; } = new List<Quote>();
    }
}
