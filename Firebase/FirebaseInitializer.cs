// Preserves the optional local key convention and respects externally supplied credentials.
namespace MedCarePortal.API.Firebase;

public static class FirebaseInitializer
{
    public static void Initialize()
    {
        string keyPath = Path.Combine(AppContext.BaseDirectory, "Config", "serviceAccountKey.json");
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS"))
            && File.Exists(keyPath))
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", keyPath);
        }
    }
}
