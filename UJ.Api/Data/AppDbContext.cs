using Microsoft.EntityFrameworkCore;
using UJ.Api.Models;

namespace UJ.Api.Data;

// The DbContext is our connection to the database. Each DbSet = one table.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<SiteContent> SiteContents => Set<SiteContent>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<AdminUser>().HasIndex(u => u.Username).IsUnique();
        b.Entity<Review>().Property(r => r.Status).HasConversion<string>(); // store "Approved" not 1
        b.Entity<SiteContent>().HasIndex(c => c.Key).IsUnique();
        b.Entity<Project>().Property(p => p.Category).HasMaxLength(50);
        b.Entity<Project>().Property(p => p.Status).HasMaxLength(30);
        b.Entity<Inquiry>().Property(i => i.Status).HasMaxLength(30);
    }
}
