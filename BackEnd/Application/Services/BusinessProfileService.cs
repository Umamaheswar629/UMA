using Application.DTOs.Common;
using Application.DTOs.Insurance;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class BusinessProfileService : IBusinessProfileService
{
    private readonly IBusinessProfileRepository _repo;

    public BusinessProfileService(IBusinessProfileRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<BusinessProfileDto>> GetByUserIdAsync(int userId)
    {
        var profile = await _repo.GetByUserIdAsync(userId);
        if (profile == null)
            return ApiResponse<BusinessProfileDto>.FailResponse("Business profile not found.");

        return ApiResponse<BusinessProfileDto>.SuccessResponse(MapToDto(profile));
    }

    public async Task<ApiResponse<BusinessProfileDto>> CreateAsync(int userId, CreateBusinessProfileRequest request)
    {
        if (await _repo.ExistsByUserIdAsync(userId))
            return ApiResponse<BusinessProfileDto>.FailResponse("Business profile already exists.");

        var profile = new BusinessProfile
        {
            UserId = userId,
            BusinessName = request.BusinessName,
            IndustryType = request.IndustryType,
            YearsInOperation = request.YearsInOperation,
            EmployeeCount = request.EmployeeCount,
            AnnualRevenue = request.AnnualRevenue,
            Location = request.Location,
            PriorClaimsCount = request.PriorClaimsCount,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(profile);
        await _repo.SaveChangesAsync();

        return ApiResponse<BusinessProfileDto>.SuccessResponse(MapToDto(profile), "Profile created.");
    }

    public async Task<ApiResponse<BusinessProfileDto>> UpdateAsync(int userId, UpdateBusinessProfileRequest request)
    {
        var profile = await _repo.GetByUserIdAsync(userId);
        if (profile == null)
            return ApiResponse<BusinessProfileDto>.FailResponse("Business profile not found.");

        profile.BusinessName = request.BusinessName;
        profile.IndustryType = request.IndustryType;
        profile.YearsInOperation = request.YearsInOperation;
        profile.EmployeeCount = request.EmployeeCount;
        profile.AnnualRevenue = request.AnnualRevenue;
        profile.Location = request.Location;
        profile.PriorClaimsCount = request.PriorClaimsCount;

        await _repo.SaveChangesAsync();

        return ApiResponse<BusinessProfileDto>.SuccessResponse(MapToDto(profile), "Profile updated.");
    }

    private static BusinessProfileDto MapToDto(BusinessProfile p) => new()
    {
        Id = p.Id,
        BusinessName = p.BusinessName,
        IndustryType = p.IndustryType,
        YearsInOperation = p.YearsInOperation,
        EmployeeCount = p.EmployeeCount,
        AnnualRevenue = p.AnnualRevenue,
        Location = p.Location,
        PriorClaimsCount = p.PriorClaimsCount
    };
}
