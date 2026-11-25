using Microsoft.EntityFrameworkCore;
using UJ.Api.Data;
using UJ.Api.Dtos;
using UJ.Api.Models;

namespace UJ.Api.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        // PUBLIC: only published projects
        app.MapGet("/api/projects", async (AppDbContext db) =>
            await db.Projects.Where(p => p.IsPublished)
                             .OrderByDescending(p => p.IsFeatured)
                             .ThenBy(p => p.SortOrder)
                             .ThenByDescending(p => p.CreatedAt)
                             .ToListAsync());

        // ADMIN: everything below needs a valid JWT
        var admin = app.MapGroup("/api/admin/projects").RequireAuthorization();

        admin.MapGet("/", async (AppDbContext db) =>
            await db.Projects.OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder)
                            .ThenByDescending(p => p.CreatedAt).ToListAsync());

        admin.MapPost("/", async (ProjectRequest req, AppDbContext db) =>
        {
            var p = new Project();
            Apply(p, req);
            db.Projects.Add(p);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/projects/{p.Id}", p);
        });

        admin.MapPut("/{id:int}", async (int id, ProjectRequest req, AppDbContext db) =>
        {
            var p = await db.Projects.FindAsync(id);
            if (p is null) return Results.NotFound();
            Apply(p, req);
            await db.SaveChangesAsync();
            return Results.Ok(p);
        });

        admin.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var p = await db.Projects.FindAsync(id);
            if (p is null) return Results.NotFound();
            db.Projects.Remove(p);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // Image upload: returns a URL that the admin form saves in ImageUrl
        admin.MapPost("/upload", async (IFormFile file, IWebHostEnvironment env) =>
        {
            string[] allowed = [".jpg", ".jpeg", ".png", ".webp"];
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowed.Contains(ext) || file.Length is 0 or > 5 * 1024 * 1024)
                return Results.BadRequest("Only jpg/png/webp images up to 5 MB are allowed.");

            // Check the file really is an image (first bytes), not just renamed
            var head = new byte[12];
            await using (var peek = file.OpenReadStream()) { _ = await peek.ReadAsync(head); }
            bool isJpg = head[0] == 0xFF && head[1] == 0xD8;
            bool isPng = head[0] == 0x89 && head[1] == 0x50 && head[2] == 0x4E && head[3] == 0x47;
            bool isWebp = head[0] == 0x52 && head[1] == 0x49 && head[8] == 0x57 && head[9] == 0x45;
            if (!(isJpg || isPng || isWebp)) return Results.BadRequest("The file is not a valid image.");

            var folder = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "uploads");
            Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{ext}";          // random name, never trust the user's name
            await using var stream = File.Create(Path.Combine(folder, fileName));
            await file.CopyToAsync(stream);

            return Results.Ok(new { url = $"/uploads/{fileName}" });
        }).DisableAntiforgery();
    }

    private static void Apply(Project p, ProjectRequest r)
    {
        p.TitleEn = r.TitleEn;
        p.TitleAr = r.TitleAr;
        p.DescriptionEn = r.DescriptionEn;
        p.DescriptionAr = r.DescriptionAr;
        p.Location = r.Location;
        p.ImageUrl = r.ImageUrl;
        p.Category = r.Category;
        p.Status = r.Status;
        p.Year = r.Year;
        p.Partner = r.Partner;
        p.IsFeatured = r.IsFeatured;
        p.SortOrder = r.SortOrder;
        p.IsPublished = r.IsPublished;
    }
}
