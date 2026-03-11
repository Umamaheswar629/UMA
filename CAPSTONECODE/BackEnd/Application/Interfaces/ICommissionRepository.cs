using Application.DTOs.Commission;
using Domain.Entities;


namespace Application.Interfaces;

public interface ICommissionRepository
{
    Task<Policy?> GetPolicyWithPlanAsync(int policyId);
    Task<User?> GetUserByIdAsync(int userId);
    Task<List<Commission>> GetByAgentIdWithDetailsAsync(int agentId);
    Task<(List<Commission> Commissions, int TotalCount)> GetCommissionsPagedAsync(
        int? agentId, int page, int pageSize);
    Task<List<AgentPerformanceDto>> GetAllAgentPerformanceAsync();
    Task AddAsync(Commission commission);
    Task SaveChangesAsync();
}