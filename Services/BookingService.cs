// Validates scheduled slots and stores at most one booking per doctor and slot.
using System.Security.Cryptography;
using System.Text.Json;
using Google.Cloud.Firestore;
using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services;

public class BookingService(FirestoreDb db) : IBookingService
{
    internal const string CollectionName = "Bookings";
    private const string OccupiedMessage = "This time slot is already booked. Please choose another time.";

    public async Task<List<Booking>> GetAllBookingsAsync()
    {
        var snapshot = await db.Collection(CollectionName).GetSnapshotAsync();
        return snapshot.Documents.Select(document => document.ConvertTo<Booking>()).ToList();
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> CreateBookingAsync(Booking booking)
    {
        var doctors = db.Collection(DoctorService.CollectionName);
        var bookings = db.Collection(CollectionName);
        var slot = JsonSerializer.SerializeToUtf8Bytes(new[] { booking.DoctorId, booking.Date, booking.Time });
        var bookingReference = bookings.Document(Convert.ToHexString(SHA256.HashData(slot)));
        var legacyBookings = bookings
            .WhereEqualTo(nameof(Booking.DoctorId), booking.DoctorId)
            .WhereEqualTo(nameof(Booking.Date), booking.Date)
            .WhereEqualTo(nameof(Booking.Time), booking.Time)
            .Limit(1);

        var result = await db.RunTransactionAsync(async transaction =>
        {
            var doctorSnapshot = await transaction.GetSnapshotAsync(doctors.Document(booking.DoctorId));
            if (!doctorSnapshot.Exists)
            {
                return (Saved: (Booking?)null, Error: "Doctor not found.");
            }

            var doctor = doctorSnapshot.ConvertTo<Doctor>();
            if (!doctor.AvailableSlots.TryGetValue(booking.Date, out var times) || !times.Contains(booking.Time))
            {
                return (Saved: (Booking?)null, Error: "This appointment time is unavailable.");
            }

            var existingBooking = await transaction.GetSnapshotAsync(bookingReference);
            if (existingBooking.Exists || (await transaction.GetSnapshotAsync(legacyBookings)).Count > 0)
            {
                return (Saved: (Booking?)null, Error: OccupiedMessage);
            }

            var saved = new Booking
            {
                Id = bookingReference.Id,
                DoctorId = booking.DoctorId,
                DoctorName = doctor.Name,
                Specialty = doctor.Specialty,
                PatientName = booking.PatientName,
                Date = booking.Date,
                Time = booking.Time,
                CreatedAt = DateTime.UtcNow
            };
            transaction.Create(bookingReference, saved);
            return (Saved: (Booking?)saved, Error: string.Empty);
        });

        if (result.Saved is not { } record)
        {
            return (false, result.Error);
        }

        booking.Id = record.Id;
        booking.DoctorName = record.DoctorName;
        booking.Specialty = record.Specialty;
        booking.CreatedAt = record.CreatedAt;
        return (true, string.Empty);
    }

    public Task<bool> CancelBookingAsync(string bookingId)
    {
        var reference = db.Collection(CollectionName).Document(bookingId);
        return db.RunTransactionAsync(async transaction =>
        {
            var snapshot = await transaction.GetSnapshotAsync(reference);
            if (!snapshot.Exists)
            {
                return false;
            }

            transaction.Delete(reference);
            return true;
        });
    }
}
