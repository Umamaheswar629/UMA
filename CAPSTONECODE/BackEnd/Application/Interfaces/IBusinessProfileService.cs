using Application.DTOs.Common;
using Application.DTOs.Insurance;

namespace Application.Interfaces;

public interface IBusinessProfileService
{
    Task<ApiResponse<BusinessProfileDto>> GetByUserIdAsync(int userId);
    Task<ApiResponse<BusinessProfileDto>> CreateAsync(int userId, CreateBusinessProfileRequest request);
    Task<ApiResponse<BusinessProfileDto>> UpdateAsync(int userId, UpdateBusinessProfileRequest request);
}
