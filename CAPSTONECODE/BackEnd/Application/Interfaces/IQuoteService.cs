using Application.DTOs.Common;
using Application.DTOs.Quote;

namespace Application.Interfaces;

public interface IQuoteService
{
    Task<ApiResponse<QuoteResponse>> GenerateQuoteAsync(int userId, QuoteRequest request);
    Task<ApiResponse<QuoteResponse>> GetQuoteByIdAsync(int id);
    Task<ApiResponse<List<QuoteResponse>>> GetUserQuotesAsync(int userId);
}
