using System.Security.Claims;
using UJ.Api.Data;
using UJ.Api.Dtos;

namespace UJ.Api.Endpoints;

public static class AccountEndpoints
{
    public static void MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        // Lets the logged-in admin change their own password
        app.MapPut("/api/admin/account/password", async (ChangePasswordRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            if (!int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Results.Unauthorized();
            var admin = await db.AdminUsers.FindAsync(id);
            if (admin is null) return Results.Unauthorized();
            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, admin.PasswordHash))
                return Results.BadRequest("The current password is wrong.");

            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization().RequireRateLimiting("login");
    }
}
