using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using UJ.Api.Models;

namespace UJ.Api.Services;

// Creates the JWT the admin receives after logging in.
public class TokenService(IConfiguration config)
{
    public string Create(AdminUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            ]),
            Issuer = config["Jwt:Issuer"],
            Audience = config["Jwt:Audience"],
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
