using Microsoft.EntityFrameworkCore;
using UJ.Api.Data;
using UJ.Api.Dtos;
using UJ.Api.Models;
using UJ.Api.Services;

namespace UJ.Api.Endpoints;

public static class InquiryEndpoints
{
    public static void MapInquiryEndpoints(this IEndpointRouteBuilder app)
    {
        // PUBLIC: contact form
        app.MapPost("/api/inquiries", async (CreateInquiryRequest req, AppDbContext db, EmailService email) =>
        {
            if (!string.IsNullOrEmpty(req.Website)) return Results.Ok();   // honeypot

            var inquiry = new Inquiry
            {
                Name = req.Name, Company = req.Company, Phone = req.Phone,
                Email = req.Email, Service = req.Service,
                PropertyType = req.PropertyType, Message = req.Message
            };

            db.Inquiries.Add(inquiry);
            await db.SaveChangesAsync();           // 1) save first, so nothing is ever lost
            await email.SendInquiryAsync(inquiry); // 2) then notify the owner(s)
            return Results.Ok();
        }).RequireRateLimiting("forms");

        // ADMIN
        var admin = app.MapGroup("/api/admin/inquiries").RequireAuthorization();

        admin.MapGet("/", async (AppDbContext db) =>
            await db.Inquiries.OrderByDescending(i => i.CreatedAt).ToListAsync());

        admin.MapPut("/{id:int}/read", async (int id, AppDbContext db) =>
        {
            var i = await db.Inquiries.FindAsync(id);
            if (i is null) return Results.NotFound();
            i.IsRead = true;
            await db.SaveChangesAsync();
            return Results.Ok(i);
        });

        // Update the follow-up status and private notes
        admin.MapPut("/{id:int}", async (int id, UpdateInquiryRequest req, AppDbContext db) =>
        {
            string[] allowed = ["New", "Contacted", "Quoted", "Won", "Lost"];
            if (!allowed.Contains(req.Status)) return Results.BadRequest("Unknown status.");
            var i = await db.Inquiries.FindAsync(id);
            if (i is null) return Results.NotFound();
            i.Status = req.Status;
            i.Notes = req.Notes;
            i.IsRead = true;
            await db.SaveChangesAsync();
            return Results.Ok(i);
        });

        admin.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var i = await db.Inquiries.FindAsync(id);
            if (i is null) return Results.NotFound();
            db.Inquiries.Remove(i);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Dashboard numbers
        app.MapGet("/api/admin/stats", async (AppDbContext db) => new
        {
            newInquiries = await db.Inquiries.CountAsync(i => !i.IsRead),
            pendingReviews = await db.Reviews.CountAsync(r => r.Status == ReviewStatus.Pending),
            projects = await db.Projects.CountAsync()
        }).RequireAuthorization();
    }
}
