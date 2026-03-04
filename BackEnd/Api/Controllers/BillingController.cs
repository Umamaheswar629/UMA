using Application.DTOs.Billing;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class BillingController : BaseApiController
{
    private readonly IBillingService _service;

    public BillingController(IBillingService service)
    {
        _service = service;
    }

    /// <summary>Get billing dashboard for current user</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _service.GetBillingDashboardAsync(GetUserId());
        return Ok(result);
    }

    /// <summary>Get invoices for a policy</summary>
    [HttpGet("policy/{policyId}/invoices")]
    public async Task<IActionResult> GetInvoicesByPolicy(int policyId)
    {
        var result = await _service.GetInvoicesByPolicyAsync(policyId, GetUserId(), GetUserRole());
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Get invoice by ID</summary>
    [HttpGet("invoices/{id}")]
    public async Task<IActionResult> GetInvoiceById(int id)
    {
        var result = await _service.GetInvoiceByIdAsync(id, GetUserId(), GetUserRole());
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Record a payment</summary>
    [HttpPost("payments")]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentRequest request)
    {
        var result = await _service.RecordPaymentAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>Generate EMI schedule for a policy</summary>
    [HttpPost("emi")]
    public async Task<IActionResult> GenerateEmi([FromBody] GenerateEmiRequest request)
    {
        var result = await _service.GenerateEmiScheduleAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}