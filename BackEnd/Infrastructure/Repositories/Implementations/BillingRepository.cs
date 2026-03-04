using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.Implementations;

public class BillingRepository : IBillingRepository
{
    private readonly AppDbContext _context;

    public BillingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Policy?> GetPolicyByIdAsync(int policyId)
        => await _context.Policies.FindAsync(policyId);

    public async Task<Policy?> GetPolicyWithInvoicesAsync(int policyId)
    {
        return await _context.Policies
            .Include(p => p.Invoices).ThenInclude(i => i.Payments)
            .FirstOrDefaultAsync(p => p.Id == policyId);
    }

    public async Task<Invoice?> GetInvoiceByIdWithDetailsAsync(int invoiceId)
    {
        return await _context.Invoices
            .Include(i => i.Policy)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);
    }

    public async Task<Invoice?> GetInvoiceWithPolicyAndPaymentsAsync(int invoiceId)
    {
        return await _context.Invoices
            .Include(i => i.Policy)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);
    }

    public async Task<List<Invoice>> GetInvoicesByPolicyAsync(int policyId)
    {
        return await _context.Invoices
            .Include(i => i.Policy)
            .Include(i => i.Payments)
            .Where(i => i.PolicyId == policyId)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<List<Invoice>> GetInvoicesByCustomerAsync(int userId)
    {
        return await _context.Invoices
            .Include(i => i.Policy)
            .Include(i => i.Payments)
            .Where(i => i.Policy != null && i.Policy.CustomerId == userId)
            .OrderByDescending(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<List<Invoice>> GetOverdueInvoicesAsync()
    {
        return await _context.Invoices
            .Include(i => i.Policy)
            .Where(i => i.Status == 0 && i.DueDate < DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task AddPaymentAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
    }

    public async Task AddInvoicesAsync(IEnumerable<Invoice> invoices)
    {
        await _context.Invoices.AddRangeAsync(invoices);
    }

    public async Task RemoveInvoiceAsync(Invoice invoice)
    {
        _context.Invoices.Remove(invoice);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
