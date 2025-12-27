using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Api.Utils
{
    public static class JwtTokenGenerator
    {
        public static string GenerateToken(
            string userId,
            string role,
            string secret,
            string issuer,
            string audience,
            int expiresMinutes = 60,
            IDictionary<string, string>? extraClaims = null)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };
            if (extraClaims != null)
            {
                foreach (var kv in extraClaims)
                    claims.Add(new Claim(kv.Key, kv.Value));
            }
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

