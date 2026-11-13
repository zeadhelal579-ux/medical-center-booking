// Configures the clinic API, Firestore connection and browser origins.
using Google.Api.Gax;
using Google.Cloud.Firestore;
using MedCarePortal.API.Firebase;
using MedCarePortal.API.Services;

var builder = WebApplication.CreateBuilder(args);
var projectId = builder.Configuration["FirebaseProjectId"];
if (string.IsNullOrWhiteSpace(projectId) || projectId == "YOUR_FIREBASE_PROJECT_ID_HERE")
{
    throw new InvalidOperationException("Set FirebaseProjectId to the intended Firestore project.");
}

var emulatorHost = builder.Configuration["FIRESTORE_EMULATOR_HOST"];
var useEmulator = !string.IsNullOrWhiteSpace(emulatorHost);
if (useEmulator && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException("The Firestore emulator requires the Development environment.");
}

if (!useEmulator)
{
    FirebaseInitializer.Initialize();
}

builder.Services.AddSingleton(_ => new FirestoreDbBuilder
{
    ProjectId = projectId,
    EmulatorDetection = useEmulator ? EmulatorDetection.EmulatorOnly : EmulatorDetection.ProductionOnly
}.Build());

builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

var frontendOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (builder.Environment.IsDevelopment())
{
    frontendOrigins = [..frontendOrigins,
        "http://localhost:5500", "http://127.0.0.1:5500",
        "http://localhost:5501", "http://127.0.0.1:5501"];
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendOrigins)
            .WithMethods("GET", "POST", "DELETE")
            .WithHeaders("Content-Type");
    });
});

var app = builder.Build();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers.CacheControl = "no-store";
    await next(context);
});

app.UseCors();
app.MapControllers();
app.Run();
