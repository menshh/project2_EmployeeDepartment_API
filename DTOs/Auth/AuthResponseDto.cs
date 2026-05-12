using System.Text.Json.Serialization;

namespace EmployeeDepartment.DTOs.Auth;

public class AuthResponseDto
{
    [JsonIgnore]
    public string AccessToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public string UserName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
