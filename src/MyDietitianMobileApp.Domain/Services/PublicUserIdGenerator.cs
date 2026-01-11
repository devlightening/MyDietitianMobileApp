namespace MyDietitianMobileApp.Domain.Services;

public static class PublicUserIdGenerator
{
    private static readonly Random _random = new Random();
    private static readonly string _characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    /// <summary>
    /// Generates a production-ready PublicUserId in format: MD-XXXX-XXXX-XX
    /// Capacity: ~3.6e15 combinations (unlimited for practical purposes)
    /// </summary>
    public static string Generate()
    {
        // Format: MD-XXXX-XXXX-XX
        var part1 = GeneratePart(4);  // XXXX
        var part2 = GeneratePart(4);  // XXXX
        var part3 = GeneratePart(2);  // XX
        
        return $"MD-{part1}-{part2}-{part3}";
    }

    private static string GeneratePart(int length)
    {
        var part = new char[length];
        for (int i = 0; i < length; i++)
        {
            part[i] = _characters[_random.Next(_characters.Length)];
        }
        return new string(part);
    }
}
