using Domain.Entities;

namespace Application.Interfaces;

public interface IQuoteRepository
{
    Task<BusinessProfile?> GetBusinessProfileAsync(int profileId, int userId);
    Task<Plan?> GetActivePlanWithTypeAsync(int planId);
    Task<Quote?> GetByIdWithDetailsAsync(int quoteId);
    Task<List<Quote>> GetByUserIdWithDetailsAsync(int userId);
    Task AddAsync(Quote quote);
    Task SaveChangesAsync();
}