namespace UJ.Api.Models;

// Admin account (only used to log in to the admin portal)
public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;   // BCrypt hash, never the real password
}

// A project shown on the website (English + Arabic text)
public class Project
{
    public int Id { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = "cabling";           // cabling | villa | cctv (matches the site's service keys)
    public string Status { get; set; } = "Completed";           // Completed | Ongoing
    public int? Year { get; set; }
    public string? Partner { get; set; }                        // contracting partner / client, optional
    public bool IsFeatured { get; set; }                        // shown first on the home page
    public int SortOrder { get; set; }                          // lower number = shown first
    public bool IsPublished { get; set; } = true;               // admin can hide a project
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ReviewStatus { Pending, Approved, Rejected }

// A customer review. It stays Pending until the admin approves it.
public class Review
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Rating { get; set; }                             // 1 to 5
    public string Comment { get; set; } = string.Empty;
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// A message sent through the contact form
public class Inquiry
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string Status { get; set; } = "New";                 // New | Contacted | Quoted | Won | Lost
    public string? Notes { get; set; }                          // private admin notes
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Editable website content (company details, hero text, highlights, services).
// Stored as one JSON document per key so the admin can change text without a code change.
public class SiteContent
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Json { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
