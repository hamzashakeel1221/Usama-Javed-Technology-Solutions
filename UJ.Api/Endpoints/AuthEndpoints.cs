using Microsoft.EntityFrameworkCore;
using UJ.Api.Data;
using UJ.Api.Dtos;
using UJ.Api.Services;

namespace UJ.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, TokenService tokens) =>
        {
            var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == req.Username);

            // Same error for "no such user" and "wrong password" so attackers learn nothing
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

            return Results.Ok(new { token = tokens.Create(user) });
        }).RequireRateLimiting("login");
    }
}
