using Application.DTOs.Quote;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class QuotesController : BaseApiController
{
    private readonly IQuoteService _service;

    public QuotesController(IQuoteService service)
    {
        _service = service;
    }

    /// <summary>Generate a new quote</summary>
    [HttpPost]
    public async Task<IActionResult> GenerateQuote([FromBody] QuoteRequest request)
    {
        var result = await _service.GenerateQuoteAsync(GetUserId(), request);
        if (!result.Success) return BadRequest(result);
        return CreatedAtAction(nameof(GetQuoteById), new { id = result.Data?.QuoteId }, result);
    }

    /// <summary>Get quote by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuoteById(int id)
    {
        var result = await _service.GetQuoteByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>Get all quotes for the current user</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyQuotes()
    {
        var result = await _service.GetUserQuotesAsync(GetUserId());
        return Ok(result);
    }
}