using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<BusinessProfile> BusinessProfiles { get; }
    DbSet<InsuranceType> InsuranceTypes { get; }
    DbSet<Plan> Plans { get; }
    DbSet<Quote> Quotes { get; }
    DbSet<Policy> Policies { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Claim> Claims { get; }
    DbSet<ClaimDocument> ClaimDocuments { get; }
    DbSet<Commission> Commissions { get; }
    DbSet<Notification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}