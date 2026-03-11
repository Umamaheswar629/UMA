using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<BusinessProfile> BusinessProfiles { get; set; }
        public DbSet<InsuranceType> InsuranceTypes { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Policy> Policies { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Claim> Claims { get; set; }
        public DbSet<ClaimDocument> ClaimDocuments { get; set; }
        public DbSet<Commission> Commissions { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // ── Relationship configurations ─────────────────────────────

            // Claim → User (Customer)
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Customer)
                .WithMany(u => u.Claims)
                .HasForeignKey(c => c.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Claim → User (Officer)
            modelBuilder.Entity<Claim>()
                .HasOne(c => c.Officer)
                .WithMany(u => u.OfficerClaims)
                .HasForeignKey(c => c.OfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Policy → User (Customer)
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.Customer)
                .WithMany(u => u.Policies)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Policy → User (Agent)
            modelBuilder.Entity<Policy>()
                .HasOne(p => p.Agent)
                .WithMany(u => u.AgentPolicies)
                .HasForeignKey(p => p.AgentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Commission → User (Agent)
            modelBuilder.Entity<Commission>()
                .HasOne(c => c.Agent)
                .WithMany(u => u.Commissions)
                .HasForeignKey(c => c.AgentId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Decimal precision configurations ────────────────────────
            modelBuilder.Entity<Plan>().Property(p => p.BasePremium).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Plan>().Property(p => p.CoverageLimit).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Plan>().Property(p => p.CommissionRate).HasColumnType("decimal(5,2)");
            modelBuilder.Entity<Quote>().Property(q => q.CalculatedPremium).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Quote>().Property(q => q.RiskScore).HasColumnType("decimal(5,2)");
            modelBuilder.Entity<Quote>().Property(q => q.RiskMultiplier).HasColumnType("decimal(4,2)");
            modelBuilder.Entity<Policy>().Property(p => p.PremiumAmount).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Invoice>().Property(i => i.Amount).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Payment>().Property(p => p.AmountPaid).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Claim>().Property(c => c.EstimatedAmount).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Claim>().Property(c => c.SettlementAmount).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Commission>().Property(c => c.CommissionAmount).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Commission>().Property(c => c.CommissionRate).HasColumnType("decimal(5,2)");
            modelBuilder.Entity<BusinessProfile>().Property(b => b.AnnualRevenue).HasColumnType("decimal(18,2)");
        }
    }
}
