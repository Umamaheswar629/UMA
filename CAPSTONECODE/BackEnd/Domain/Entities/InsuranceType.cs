using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class InsuranceType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<Plan> Plans { get; set; } = new List<Plan>();
    }
}
