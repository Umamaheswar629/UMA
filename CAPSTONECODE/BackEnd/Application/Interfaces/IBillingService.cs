using Application.DTOs.Billing;
using Application.DTOs.Common;
using Domain.Enmus;

namespace Application.Interfaces;

public interface IBillingService
{
    Task<ApiResponse<BillingDashboardDto>> GetBillingDashboardAsync(int userId);
    Task<ApiResponse<List<InvoiceDto>>> GetInvoicesByPolicyAsync(int policyId, int userId, UserRole role);
    Task<ApiResponse<InvoiceDto>> GetInvoiceByIdAsync(int id, int userId, UserRole role);
    Task<ApiResponse<PaymentDto>> RecordPaymentAsync(int userId, RecordPaymentRequest request);
    Task<ApiResponse<List<InvoiceDto>>> GenerateEmiScheduleAsync(int userId, GenerateEmiRequest request);
}
