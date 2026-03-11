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

        // Years in operation (larger impact)
        if (profile.YearsInOperation > 10) { score -= 15; breakdown["Years in Operation (10+)"] = -15; }
        else if (profile.YearsInOperation > 5) { score -= 5; breakdown["Years in Operation (5-10)"] = -5; }
        else if (profile.YearsInOperation < 2) { score += 15; breakdown["New Business (<2 yrs)"] = 15; }
        else { score += 5; breakdown["Years in Operation (2-5)"] = 5; }

        // Employee count (larger thresholds)
        if (profile.EmployeeCount > 500) { score += 15; breakdown["Large Workforce (500+)"] = 15; }
        else if (profile.EmployeeCount > 100) { score += 8; breakdown["Medium Workforce (100-500)"] = 8; }
        else if (profile.EmployeeCount < 10) { score += 5; breakdown["Small Team (<10)"] = 5; }

        // Safety certification (larger impact)
        if (profile.HasSafetyCertification) { score -= 15; breakdown["Safety Certification"] = -15; }
        else { score += 15; breakdown["No Safety Certification"] = 15; }

        // Revenue factor (larger impact)
        if (profile.AnnualRevenue > 50_000_000) { score += 12; breakdown["Very High Revenue (50M+)"] = 12; }
        else if (profile.AnnualRevenue > 10_000_000) { score += 8; breakdown["High Revenue (10M+)"] = 8; }
        else if (profile.AnnualRevenue < 500_000) { score += 5; breakdown["Low Revenue (<5L)"] = 5; }

        // Industry type risk
        var highRiskIndustries = new[] { "manufacturing", "construction", "mining", "chemical", "oil", "gas", "transport" };
        if (!string.IsNullOrEmpty(profile.IndustryType) &&
            highRiskIndustries.Any(i => profile.IndustryType.Contains(i, StringComparison.OrdinalIgnoreCase)))
        {
            score += 10; breakdown["High-Risk Industry"] = 10;
        }

        score = Math.Clamp(score, 0, 100);

        string level;
        string levelName;
        decimal multiplier;
        if (score <= 30) { level = "Low"; levelName = "Low Risk"; multiplier = 0.75m; }
        else if (score <= 50) { level = "Medium"; levelName = "Medium Risk"; multiplier = 1.0m; }
        else if (score <= 70) { level = "High"; levelName = "High Risk"; multiplier = 1.4m; }
        else { level = "VeryHigh"; levelName = "Very High Risk"; multiplier = 1.85m; }

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
