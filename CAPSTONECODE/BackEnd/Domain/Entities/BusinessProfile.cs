using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class BusinessProfile
    {
        public int Id { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string IndustryType { get; set; } = string.Empty;
        public int YearsInOperation { get; set; }
        public int EmployeeCount { get; set; }
        public decimal AnnualRevenue { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool HasSafetyCertification { get; set; }
        public string? SafetyCertificatePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        
        public User? User { get; set; }
        public ICollection<Quote> Quotes { get; set; } = new List<Quote>();
    }
}
