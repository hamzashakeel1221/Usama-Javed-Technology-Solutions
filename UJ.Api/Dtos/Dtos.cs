using System.ComponentModel.DataAnnotations;
using UJ.Api.Models;

namespace UJ.Api.Dtos;

// DTOs describe exactly what the API accepts from outside.
// The validation attributes are checked automatically (AddValidation() in Program.cs).

public class LoginRequest
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class CreateInquiryRequest
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [MaxLength(100)] public string? Company { get; set; }
    [Required, MaxLength(30)] public string Phone { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(150)] public string Email { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Service { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string PropertyType { get; set; } = string.Empty;
    [Required, MaxLength(2000)] public string Message { get; set; } = string.Empty;
    public string? Website { get; set; }   // honeypot: hidden field, real users leave it empty
}

public class CreateReviewRequest
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [Range(1, 5)] public int Rating { get; set; }
    [Required, MaxLength(1000)] public string Comment { get; set; } = string.Empty;
    public string? Website { get; set; }   // honeypot
}

public class UpdateReviewStatusRequest
{
    public ReviewStatus Status { get; set; }
}

public class ProjectRequest
{
    [Required, MaxLength(150)] public string TitleEn { get; set; } = string.Empty;
    [Required, MaxLength(150)] public string TitleAr { get; set; } = string.Empty;
    [Required, MaxLength(2000)] public string DescriptionEn { get; set; } = string.Empty;
    [Required, MaxLength(2000)] public string DescriptionAr { get; set; } = string.Empty;
    [MaxLength(150)] public string? Location { get; set; }
    [MaxLength(300)] public string? ImageUrl { get; set; }
    [Required, MaxLength(50)] public string Category { get; set; } = "cabling";
    [Required, MaxLength(30)] public string Status { get; set; } = "Completed";
    [Range(1990, 2100)] public int? Year { get; set; }
    [MaxLength(150)] public string? Partner { get; set; }
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class UpdateInquiryRequest
{
    [Required, MaxLength(30)] public string Status { get; set; } = "New";
    [MaxLength(4000)] public string? Notes { get; set; }
}

public class ChangePasswordRequest
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;
    [Required, MinLength(8), MaxLength(100)] public string NewPassword { get; set; } = string.Empty;
}
