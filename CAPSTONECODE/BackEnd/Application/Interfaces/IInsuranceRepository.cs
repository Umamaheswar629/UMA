using Domain.Entities;

namespace Application.Interfaces;

public interface IInsuranceRepository
{
    // Insurance Types
    Task<List<InsuranceType>> GetAllTypesAsync(bool activeOnly);
    Task<InsuranceType?> GetTypeByIdWithPlansAsync(int id);
    Task<InsuranceType?> GetTypeByIdAsync(int id);
    Task AddTypeAsync(InsuranceType type);

    // Plans
    Task<List<Plan>> GetPlansByTypeAsync(int insuranceTypeId);
    Task AddPlanAsync(Plan plan);

    Task SaveChangesAsync();
}