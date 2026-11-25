using Microsoft.EntityFrameworkCore;
using UJ.Api.Data;
using UJ.Api.Dtos;
using UJ.Api.Models;

namespace UJ.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        // PUBLIC: only APPROVED reviews are visible
        app.MapGet("/api/reviews", async (AppDbContext db) =>
            await db.Reviews.Where(r => r.Status == ReviewStatus.Approved)
                            .OrderByDescending(r => r.CreatedAt)
                            .Select(r => new { r.Id, r.Name, r.Rating, r.Comment, r.CreatedAt })
                            .ToListAsync());

        // PUBLIC: submit a review. It is saved as Pending until the admin approves it.
        app.MapPost("/api/reviews", async (CreateReviewRequest req, AppDbContext db) =>
        {
            if (!string.IsNullOrEmpty(req.Website)) return Results.Ok();   // honeypot

            db.Reviews.Add(new Review { Name = req.Name, Rating = req.Rating, Comment = req.Comment });
            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireRateLimiting("forms");

        // ADMIN
        var admin = app.MapGroup("/api/admin/reviews").RequireAuthorization();

        admin.MapGet("/", async (AppDbContext db) =>
            await db.Reviews.OrderByDescending(r => r.CreatedAt).ToListAsync());

        admin.MapPut("/{id:int}/status", async (int id, UpdateReviewStatusRequest req, AppDbContext db) =>
        {
            if (!Enum.IsDefined(req.Status)) return Results.BadRequest("Unknown status.");
            var r = await db.Reviews.FindAsync(id);
            if (r is null) return Results.NotFound();
            r.Status = req.Status;
            await db.SaveChangesAsync();
            return Results.Ok(r);
        });

        admin.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var r = await db.Reviews.FindAsync(id);
            if (r is null) return Results.NotFound();
            db.Reviews.Remove(r);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
