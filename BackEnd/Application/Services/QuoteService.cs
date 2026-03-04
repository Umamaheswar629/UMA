using Application.DTOs.Common;
using Application.DTOs.Quote;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enmus;

namespace Application.Services;

public class QuoteService : IQuoteService
{
    private readonly IQuoteRepository _repo;

    public QuoteService(IQuoteRepository repo)
    {
        _repo = repo;
    }

    public async Task<ApiResponse<QuoteResponse>> GenerateQuoteAsync(int userId, QuoteRequest request)
    {
        var profile = await _repo.GetBusinessProfileAsync(request.BusinessProfileId, userId);
        if (profile == null)
            return ApiResponse<QuoteResponse>.FailResponse("Business profile not found or unauthorized.");

        var plan = await _repo.GetActivePlanWithTypeAsync(request.PlanId);
        if (plan == null)
            return ApiResponse<QuoteResponse>.FailResponse("Plan not found or inactive.");

        // Calculate risk score
        var riskResult = CalculateRiskScore(profile);

        var quote = new Quote
        {
            BusinessProfileId = profile.Id,
            PlanId = plan.Id,
            CalculatedPremium = Math.Round(plan.BasePremium * riskResult.Multiplier, 2),
            RiskLevel = (int)Enum.Parse<RiskLevel>(riskResult.Level),
            RiskScore = riskResult.Score,
            RiskMultiplier = riskResult.Multiplier,
            IsConverted = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(quote);
        await _repo.SaveChangesAsync();

        return ApiResponse<QuoteResponse>.SuccessResponse(new QuoteResponse
        {
            QuoteId = quote.Id,
            PlanId = plan.Id,
            PlanName = plan.TierName,
            InsuranceTypeName = plan.InsuranceType?.Name ?? "",
            TierName = plan.TierName,
            BasePremium = plan.BasePremium,
            RiskScore = riskResult,
            FinalPremium = quote.CalculatedPremium,
            CoverageLimit = plan.CoverageLimit,
            Features = ParseFeatures(plan.Features),
            IsConverted = false,
            CreatedAt = quote.CreatedAt
        }, "Quote generated.");
    }

    public async Task<ApiResponse<QuoteResponse>> GetQuoteByIdAsync(int id)
    {
        var quote = await _repo.GetByIdWithDetailsAsync(id);
        if (quote == null)
            return ApiResponse<QuoteResponse>.FailResponse("Quote not found.");

        return ApiResponse<QuoteResponse>.SuccessResponse(MapToResponse(quote));
    }

    public async Task<ApiResponse<List<QuoteResponse>>> GetUserQuotesAsync(int userId)
    {
        var quotes = await _repo.GetByUserIdWithDetailsAsync(userId);
        return ApiResponse<List<QuoteResponse>>.SuccessResponse(
            quotes.Select(MapToResponse).ToList());
    }

    private static RiskScoreDto CalculateRiskScore(BusinessProfile profile)
    {
        decimal score = 50;
        var breakdown = new Dictionary<string, decimal>();

        // Years in operation (lower risk with more years)
        if (profile.YearsInOperation > 10) { score -= 10; breakdown["Years in Operation"] = -10; }
        else if (profile.YearsInOperation > 5) { score -= 5; breakdown["Years in Operation"] = -5; }
        else if (profile.YearsInOperation < 2) { score += 10; breakdown["Years in Operation"] = 10; }

        // Employee count
        if (profile.EmployeeCount > 500) { score += 10; breakdown["Employee Count"] = 10; }
        else if (profile.EmployeeCount > 100) { score += 5; breakdown["Employee Count"] = 5; }

        // Prior claims
        var claimImpact = profile.PriorClaimsCount * 5;
        if (claimImpact > 0) { score += claimImpact; breakdown["Prior Claims"] = claimImpact; }

        // Revenue factor
        if (profile.AnnualRevenue > 10_000_000) { score += 5; breakdown["Annual Revenue"] = 5; }

        score = Math.Clamp(score, 0, 100);

        string level;
        string levelName;
        decimal multiplier;
        if (score <= 30) { level = "Low"; levelName = "Low Risk"; multiplier = 0.8m; }
        else if (score <= 60) { level = "Medium"; levelName = "Medium Risk"; multiplier = 1.0m; }
        else { level = "High"; levelName = "High Risk"; multiplier = 1.3m; }

        return new RiskScoreDto
        {
            Score = Math.Round(score, 2),
            Level = level,
            LevelName = levelName,
            Multiplier = multiplier,
            Breakdown = breakdown
        };
    }

    private static QuoteResponse MapToResponse(Quote q)
    {
        var riskLevel = ((RiskLevel)q.RiskLevel).ToString();
        return new QuoteResponse
        {
            QuoteId = q.Id,
            PlanId = q.PlanId,
            PlanName = q.Plan?.TierName ?? "",
            InsuranceTypeName = q.Plan?.InsuranceType?.Name ?? "",
            TierName = q.Plan?.TierName ?? "",
            BasePremium = q.Plan?.BasePremium ?? 0,
            RiskScore = new RiskScoreDto
            {
                Score = q.RiskScore,
                Level = riskLevel,
                LevelName = riskLevel + " Risk",
                Multiplier = q.RiskMultiplier,
                Breakdown = new()
            },
            FinalPremium = q.CalculatedPremium,
            CoverageLimit = q.Plan?.CoverageLimit ?? 0,
            Features = ParseFeatures(q.Plan?.Features),
            IsConverted = q.IsConverted,
            CreatedAt = q.CreatedAt
        };
    }

    private static List<string> ParseFeatures(string? features)
    {
        if (string.IsNullOrWhiteSpace(features)) return new List<string>();
        return features.Split(new[] { ',', ';', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(f => f.Trim())
            .Where(f => !string.IsNullOrEmpty(f))
            .ToList();
    }
}
