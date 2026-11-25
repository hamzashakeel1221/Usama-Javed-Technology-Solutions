using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using UJ.Api.Models;

namespace UJ.Api.Services;

// Settings come from the "Email" section of appsettings.json / user-secrets
public class EmailSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;   // the Gmail that SENDS the alert
    public string Password { get; set; } = string.Empty;   // Gmail App Password
    public string FromName { get; set; } = "UJ Website";
    public List<string> Recipients { get; set; } = [];     // everyone who RECEIVES the alert
}

// Sends the "new inquiry" alert. If email fails, we only log it:
// the inquiry is already saved in the database, so nothing is lost.
public class EmailService(IOptions<EmailSettings> options, ILogger<EmailService> log)
{
    public async Task SendInquiryAsync(Inquiry i)
    {
        var s = options.Value;
        if (string.IsNullOrWhiteSpace(s.Password) || s.Recipients.Count == 0)
        {
            log.LogWarning("Email not configured, skipping notification.");
            return;
        }

        try
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress(s.FromName, s.Username));
            foreach (var r in s.Recipients) msg.To.Add(MailboxAddress.Parse(r));
            msg.ReplyTo.Add(MailboxAddress.Parse(i.Email));   // hitting Reply goes to the customer
            msg.Subject = $"New inquiry from {i.Name}: {i.Service}";
            msg.Body = new TextPart("plain")
            {
                Text = $"""
                    Name:      {i.Name}
                    Company:   {i.Company}
                    Phone:     {i.Phone}
                    Email:     {i.Email}
                    Service:   {i.Service}
                    Property:  {i.PropertyType}

                    Message:
                    {i.Message}
                    """
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(s.Host, s.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(s.Username, s.Password);
            await client.SendAsync(msg);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Failed to send inquiry email.");
        }
    }
}
