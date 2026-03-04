using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Claim
    {
        public int Id { get; set; }
        public string ClaimNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int PolicyId { get; set; }
        public string IncidentType { get; set; } = string.Empty;
        public DateTime IncidentDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal EstimatedAmount { get; set; }
        public int Status { get; set; }
        public DateTime FiledAt { get; set; }
        public int? OfficerId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public decimal? SettlementAmount { get; set; }
        public DateTime? SettledAt { get; set; }
        public string? RejectionReason { get; set; }
        public string? OfficerNotes { get; set; }

        public User? Customer { get; set; }
        public Policy? Policy { get; set; }
        public User? Officer { get; set; }
        public ICollection<ClaimDocument> Documents { get; set; } = new List<ClaimDocument>();
    }
}
