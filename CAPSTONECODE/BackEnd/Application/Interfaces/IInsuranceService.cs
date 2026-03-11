using Application.DTOs.Common;
using Application.DTOs.Insurance;

namespace Application.Interfaces;

public interface IInsuranceService
{
    Task<ApiResponse<List<InsuranceTypeDto>>> GetAllTypesAsync(bool activeOnly);
    Task<ApiResponse<InsuranceTypeDto>> GetTypeByIdAsync(int id);
    Task<ApiResponse<InsuranceTypeDto>> CreateInsuranceTypeAsync(CreateInsuranceTypeRequest request);
    Task<ApiResponse<InsuranceTypeDto>> UpdateInsuranceTypeAsync(int id, CreateInsuranceTypeRequest request);
    Task<ApiResponse<InsuranceTypeDto>> ToggleInsuranceTypeStatusAsync(int id);
    Task<ApiResponse<List<PlanDto>>> GetPlansByTypeAsync(int insuranceTypeId);
    Task<ApiResponse<PlanComparisonDto>> GetPlanComparisonAsync(int insuranceTypeId);
    Task<ApiResponse<PlanDto>> CreatePlanAsync(CreatePlanRequest request);
}
