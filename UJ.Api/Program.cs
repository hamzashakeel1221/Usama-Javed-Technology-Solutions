using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UJ.Api.Data;
using UJ.Api.Endpoints;
using UJ.Api.Models;
using UJ.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Fail fast with a clear message if required settings are missing
string[] required = ["ConnectionStrings:Default", "Jwt:Key", "Jwt:Issuer", "Jwt:Audience", "Admin:Username", "Admin:Password"];
var missing = required.Where(k => string.IsNullOrWhiteSpace(config[k])).ToList();
if (missing.Count > 0)
    throw new InvalidOperationException(
        $"Missing settings: {string.Join(", ", missing)}. Set them in appsettings.Development.json, user-secrets or environment variables.");

// ---------- 1. Services (the "what do we need" part) ----------

// Database: PostgreSQL through EF Core
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(config.GetConnectionString("Default")));

builder.Services.AddValidation();   // checks [Required], [EmailAddress] etc. automatically
// Send and accept enums as text ("Approved") as well as numbers
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddOpenApi();      // API documentation at /openapi/v1.json

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<EmailService>();
builder.Services.Configure<EmailSettings>(config.GetSection("Email"));

// Authentication: validate the JWT sent in the "Authorization: Bearer ..." header
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = config["Jwt:Issuer"],
        ValidAudience = config["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
    });
builder.Services.AddAuthorization();

// CORS: lets the React dev server (port 5173) call this API
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(config.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()));

// Rate limiting: protects forms and login from spam / brute force (limit per IP address)
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    o.AddPolicy("forms", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1) }));

    o.AddPolicy("login", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(5) }));
});

// Compress HTML, CSS, JS and JSON (faster pages = better Google ranking)
builder.Services.AddResponseCompression(o =>
{
    o.EnableForHttps = true;
    o.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    o.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
    o.MimeTypes = Microsoft.AspNetCore.ResponseCompression.ResponseCompressionDefaults.MimeTypes
        .Concat(["image/svg+xml", "application/xml", "text/xml", "application/manifest+json"]);
});

var app = builder.Build();

// ---------- 2. Create / update the database and the first admin ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();   // applies EF migrations automatically

    if (!db.AdminUsers.Any())
    {
        db.AdminUsers.Add(new AdminUser
        {
            Username = config["Admin:Username"]!,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(config["Admin:Password"]!)
        });
        db.SaveChanges();
    }

    // First run: add the two projects from the company profile so the site isn't empty
    if (!db.Projects.Any())
    {
        db.Projects.AddRange(
            new Project
            {
                TitleEn = "Ash Mount School", TitleAr = "مدرسة آش ماونت",
                DescriptionEn = "Structured cabling and networking works for a school campus in Mudon, delivered with Orion Contracting.",
                DescriptionAr = "أعمال الكابلات المهيكلة والشبكات لحرم مدرسي في مدن، بالتعاون مع أوريون للمقاولات.",
                Location = "Mudon, Dubai", Category = "cabling", Status = "Completed", Year = 2026,
                Partner = "Orion Contracting", IsFeatured = true, SortOrder = 1
            },
            new Project
            {
                TitleEn = "Damac Lagoons", TitleAr = "داماك لاقونز",
                DescriptionEn = "Villa cabling, network points and data outlets for residential units in Damac Lagoons.",
                DescriptionAr = "تمديدات كابلات الفلل ونقاط الشبكة ومخارج البيانات للوحدات السكنية في داماك لاقونز.",
                Location = "Dubai", Category = "villa", Status = "Completed", Year = 2026,
                IsFeatured = true, SortOrder = 2
            });
        db.SaveChanges();
    }
}

// ---------- 3. Middleware pipeline (ORDER MATTERS) ----------
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseResponseCompression();

// One URL per page: /about/ and /index.html redirect (301) to /about and /
app.Use(async (ctx, next) =>
{
    var p = ctx.Request.Path.Value ?? "/";
    if (HttpMethods.IsGet(ctx.Request.Method) && !p.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
    {
        string? target = null;
        if (p.Length > 1 && p.EndsWith('/')) target = p.TrimEnd('/');
        else if (p.EndsWith("/index.html", StringComparison.OrdinalIgnoreCase)) target = p[..^"index.html".Length].TrimEnd('/');
        if (target is not null)
        {
            ctx.Response.Redirect((target.Length == 0 ? "/" : target) + ctx.Request.QueryString, permanent: true);
            return;
        }
    }
    await next();
});

// Pre-rendered pages: /about → wwwroot/about/index.html (built by `npm run build` for SEO)
app.Use(async (ctx, next) =>
{
    var path = ctx.Request.Path.Value ?? "/";
    if ((HttpMethods.IsGet(ctx.Request.Method) || HttpMethods.IsHead(ctx.Request.Method))
        && !path.StartsWith("/api", StringComparison.OrdinalIgnoreCase)
        && !Path.HasExtension(path) && app.Environment.WebRootPath is { } web)
    {
        var page = Path.Combine(web, path.Trim('/').Replace('/', Path.DirectorySeparatorChar), "index.html");
        if (path.Contains("..") is false && File.Exists(page))
            ctx.Request.Path = (path.TrimEnd('/') + "/index.html");
    }
    await next();
});
app.UseStaticFiles(new StaticFileOptions   // serves wwwroot (uploaded images and the React build)
{
    OnPrepareResponse = f =>
    {
        // Hashed build files never change → cache for a year. Pages are always re-checked.
        var reqPath = f.Context.Request.Path.Value ?? "";
        f.Context.Response.Headers.CacheControl =
            reqPath.StartsWith("/assets/") ? "public, max-age=31536000, immutable"
            : reqPath.EndsWith(".html") ? "no-cache"
            : "public, max-age=604800";
    }
});
app.UseRouting();           // must come AFTER static files, or the fallback endpoint hides the pre-rendered pages
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();    // "who are you?"
app.UseAuthorization();     // "are you allowed?"

// ---------- 4. Endpoints ----------
app.MapAuthEndpoints();
app.MapProjectEndpoints();
app.MapReviewEndpoints();
app.MapInquiryEndpoints();
app.MapContentEndpoints();
app.MapAccountEndpoints();

// React app: /admin URLs get the app shell so deep links work.
// Any other unknown URL gets the "page not found" page with a real 404 status
// (a 200 here would make Google index empty/duplicate pages).
var webRoot = app.Environment.WebRootPath ?? "";
var spaFile = File.Exists(Path.Combine(webRoot, "spa.html")) ? "spa.html" : "index.html";
app.MapFallback(async ctx =>
{
    var reqPath = ctx.Request.Path.Value ?? "/";
    var notFound = Path.Combine(webRoot, "404.html");
    var isApp = reqPath.StartsWith("/admin", StringComparison.OrdinalIgnoreCase);
    if (reqPath.StartsWith("/api", StringComparison.OrdinalIgnoreCase)) { ctx.Response.StatusCode = 404; return; }
    if (!isApp && File.Exists(notFound)) ctx.Response.StatusCode = 404;
    ctx.Response.ContentType = "text/html; charset=utf-8";
    ctx.Response.Headers.CacheControl = "no-cache";
    await ctx.Response.SendFileAsync(Path.Combine(webRoot, isApp || !File.Exists(notFound) ? spaFile : "404.html"));
});

app.Run();
