using System.Text.Json;
using Application.DTOs.Common;
using Application.DTOs.Insurance;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class InsuranceService : IInsuranceService
{
    private readonly IInsuranceRepository _repo;

    public InsuranceService(IInsuranceRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<List<InsuranceTypeDto>>> GetAllTypesAsync(bool activeOnly)
    {
        var types = await _repo.GetAllTypesAsync(activeOnly);
        var dtos = types.Select(t => new InsuranceTypeDto
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Category = t.Category,
            IsActive = t.IsActive,
            PlanCount = t.Plans?.Count ?? 0
        }).ToList();

        return ApiResponse<List<InsuranceTypeDto>>.SuccessResponse(dtos);
    }

    public async Task<ApiResponse<InsuranceTypeDto>> GetTypeByIdAsync(int id)
    {
        var type = await _repo.GetTypeByIdWithPlansAsync(id);
        if (type == null)
            return ApiResponse<InsuranceTypeDto>.FailResponse("Insurance type not found.");

        return ApiResponse<InsuranceTypeDto>.SuccessResponse(new InsuranceTypeDto
        {
            Id = type.Id,
            Name = type.Name,
            Description = type.Description,
            Category = type.Category,
            IsActive = type.IsActive,
            PlanCount = type.Plans?.Count ?? 0
        });
    }

    public async Task<ApiResponse<InsuranceTypeDto>> CreateInsuranceTypeAsync(CreateInsuranceTypeRequest request)
    {
        var type = new InsuranceType
        {
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddTypeAsync(type);
        await _repo.SaveChangesAsync();

        return ApiResponse<InsuranceTypeDto>.SuccessResponse(new InsuranceTypeDto
        {
            Id = type.Id,
            Name = type.Name,
            Description = type.Description,
            Category = type.Category,
            IsActive = type.IsActive,
            PlanCount = 0
        }, "Insurance type created.");
    }

    public async Task<ApiResponse<InsuranceTypeDto>> UpdateInsuranceTypeAsync(int id, CreateInsuranceTypeRequest request)
    {
        var type = await _repo.GetTypeByIdAsync(id);
        if (type == null)
            return ApiResponse<InsuranceTypeDto>.FailResponse("Insurance type not found.");

        type.Name = request.Name;
        type.Description = request.Description;
        type.Category = request.Category;

        await _repo.SaveChangesAsync();

        return ApiResponse<InsuranceTypeDto>.SuccessResponse(new InsuranceTypeDto
        {
            Id = type.Id,
            Name = type.Name,
            Description = type.Description,
            Category = type.Category,
            IsActive = type.IsActive,
            PlanCount = type.Plans?.Count ?? 0
        }, "Insurance type updated.");
    }

    public async Task<ApiResponse<InsuranceTypeDto>> ToggleInsuranceTypeStatusAsync(int id)
    {
        var type = await _repo.GetTypeByIdAsync(id);
        if (type == null)
            return ApiResponse<InsuranceTypeDto>.FailResponse("Insurance type not found.");

        type.IsActive = !type.IsActive;
        await _repo.SaveChangesAsync();

        return ApiResponse<InsuranceTypeDto>.SuccessResponse(new InsuranceTypeDto
        {
            Id = type.Id,
            Name = type.Name,
            Description = type.Description,
            Category = type.Category,
            IsActive = type.IsActive,
            PlanCount = type.Plans?.Count ?? 0
        }, type.IsActive ? "Insurance type activated." : "Insurance type deactivated.");
    }

    public async Task<ApiResponse<List<PlanDto>>> GetPlansByTypeAsync(int insuranceTypeId)
    {
        var plans = await _repo.GetPlansByTypeAsync(insuranceTypeId);
        var dtos = plans.Select(p => MapPlanToDto(p)).ToList();
        return ApiResponse<List<PlanDto>>.SuccessResponse(dtos);
    }

    public async Task<ApiResponse<PlanComparisonDto>> GetPlanComparisonAsync(int insuranceTypeId)
    {
        var type = await _repo.GetTypeByIdWithPlansAsync(insuranceTypeId);
        if (type == null)
            return ApiResponse<PlanComparisonDto>.FailResponse("Insurance type not found.");

        var activePlans = type.Plans.Where(p => p.IsActive).ToList();

        // Split plans by tier name into Basic, Standard, Premium
        var basicPlan = activePlans.FirstOrDefault(p =>
            p.TierName.Equals("Basic", StringComparison.OrdinalIgnoreCase));
        var standardPlan = activePlans.FirstOrDefault(p =>
            p.TierName.Equals("Standard", StringComparison.OrdinalIgnoreCase));
        var premiumPlan = activePlans.FirstOrDefault(p =>
            p.TierName.Equals("Premium", StringComparison.OrdinalIgnoreCase));

        var comparison = new PlanComparisonDto
        {
            InsuranceTypeId = type.Id,
            InsuranceTypeName = type.Name,
            Description = type.Description,
            BasicPlan = basicPlan != null ? MapPlanToDto(basicPlan, type.Name) : null,
            StandardPlan = standardPlan != null ? MapPlanToDto(standardPlan, type.Name) : null,
            PremiumPlan = premiumPlan != null ? MapPlanToDto(premiumPlan, type.Name) : null
        };

        return ApiResponse<PlanComparisonDto>.SuccessResponse(comparison);
    }

    public async Task<ApiResponse<PlanDto>> CreatePlanAsync(CreatePlanRequest request)
    {
        var type = await _repo.GetTypeByIdAsync(request.InsuranceTypeId);
        if (type == null)
            return ApiResponse<PlanDto>.FailResponse("Insurance type not found.");

        var plan = new Plan
        {
            InsuranceTypeId = request.InsuranceTypeId,
            TierName = request.TierName,
            BasePremium = request.BasePremium,
            CoverageLimit = request.CoverageLimit,
            CommissionRate = request.CommissionRate,
            Features = SerializeList(request.Features),
            Exclusions = SerializeList(request.Exclusions),
            IsActive = true
        };

        await _repo.AddPlanAsync(plan);
        await _repo.SaveChangesAsync();

        return ApiResponse<PlanDto>.SuccessResponse(MapPlanToDto(plan, type.Name), "Plan created.");
    }

    private static PlanDto MapPlanToDto(Plan p, string? insuranceTypeName = null) => new()
    {
        Id = p.Id,
        InsuranceTypeId = p.InsuranceTypeId,
        InsuranceTypeName = insuranceTypeName ?? p.InsuranceType?.Name ?? "",
        TierName = p.TierName,
        BasePremium = p.BasePremium,
        CoverageLimit = p.CoverageLimit,
        CommissionRate = p.CommissionRate,
        Features = ParseJsonList(p.Features),
        Exclusions = ParseJsonList(p.Exclusions),
        IsActive = p.IsActive
    };

    internal static List<string> ParseJsonList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return new List<string>();

        // Try JSON array first: ["a","b","c"]
        raw = raw.Trim();
        if (raw.StartsWith("["))
        {
            try
            {
                var list = JsonSerializer.Deserialize<List<string>>(raw);
                return list ?? new List<string>();
            }
            catch { }
        }

        // Fallback: comma/semicolon/newline separated
        return raw.Split(new[] { ',', ';', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(f => f.Trim())
            .Where(f => !string.IsNullOrEmpty(f))
            .ToList();
    }

    private static string SerializeList(List<string>? items)
    {
        if (items == null || items.Count == 0) return "[]";
        return JsonSerializer.Serialize(items);
    }
}
