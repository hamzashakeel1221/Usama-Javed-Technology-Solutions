using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UJ.Api.Data;
using UJ.Api.Models;

namespace UJ.Api.Endpoints;

// Website content the admin can edit (company details, hero text, highlights, services).
// The front end has built-in defaults and only overrides what is saved here.
public static class ContentEndpoints
{
    private const string MainKey = "site";

    public static void MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        // PUBLIC
        app.MapGet("/api/content", async (AppDbContext db) =>
        {
            var c = await db.SiteContents.AsNoTracking().FirstOrDefaultAsync(x => x.Key == MainKey);
            return Results.Content(c?.Json ?? "{}", "application/json");
        });

        // ADMIN
        app.MapPut("/api/admin/content", async (JsonElement body, AppDbContext db) =>
        {
            if (body.ValueKind != JsonValueKind.Object) return Results.BadRequest("Content must be a JSON object.");
            var json = body.GetRawText();
            if (json.Length > 200_000) return Results.BadRequest("Content is too large.");

            var c = await db.SiteContents.FirstOrDefaultAsync(x => x.Key == MainKey);
            if (c is null) db.SiteContents.Add(c = new SiteContent { Key = MainKey });
            c.Json = json;
            c.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization();
    }
}
