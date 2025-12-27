using System.ComponentModel.DataAnnotations;

namespace MyDietitianMobileApp.Api.Models
{
    public class RegisterDietitianRequest
    {
        [Required]
        public string FullName { get; set; }
        [Required]
        public string ClinicName { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class LoginDietitianRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class LoginClientWithAccessKeyRequest
    {
        [Required]
        public string AccessKey { get; set; }
    }
}
