using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int Role { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }

        public BusinessProfile? BusinessProfile { get; set; }
        
        public ICollection<Policy> AgentPolicies { get; set; } = new List<Policy>();
        public ICollection<Policy> Policies { get; set; } = new List<Policy>();
        public ICollection<Claim> Claims { get; set; } = new List<Claim>();
        public ICollection<Claim> OfficerClaims { get; set; } = new List<Claim>();
        public ICollection<Commission> Commissions { get; set; } = new List<Commission>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
