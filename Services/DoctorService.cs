// Reads the doctor directory, excludes occupied slots and updates rating aggregates.
using Google.Cloud.Firestore;
using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services;

public class DoctorService(FirestoreDb db) : IDoctorService
{
    internal const string CollectionName = "Doctors";

    public Task<List<Doctor>> GetAllDoctorsAsync() =>
        GetDoctorsAsync(db.Collection(CollectionName));

    public Task<List<Doctor>> GetDoctorsBySpecialtyAsync(string specialty) =>
        GetDoctorsAsync(db.Collection(CollectionName).WhereEqualTo(nameof(Doctor.Specialty), specialty));

    public Task<bool> RateDoctorAsync(string doctorId, int newRating)
    {
        var reference = db.Collection(CollectionName).Document(doctorId);

        return db.RunTransactionAsync(async transaction =>
        {
            var snapshot = await transaction.GetSnapshotAsync(reference);
            if (!snapshot.Exists)
            {
                return false;
            }

            var doctor = snapshot.ConvertTo<Doctor>();
            var ratingCount = doctor.RatingCount + 1;
            var rating = ((doctor.Rating * doctor.RatingCount) + newRating) / ratingCount;
            transaction.Update(reference, new Dictionary<string, object>
            {
                [nameof(Doctor.Rating)] = rating,
                [nameof(Doctor.RatingCount)] = ratingCount
            });
            return true;
        });
    }

    private async Task<List<Doctor>> GetDoctorsAsync(Query query)
    {
        var doctorsSnapshot = await query.GetSnapshotAsync();
        var doctors = doctorsSnapshot.Documents.Select(document => document.ConvertTo<Doctor>()).ToList();
        if (doctors.Count == 0)
        {
            return doctors;
        }

        var bookings = await db.Collection(BookingService.CollectionName).GetSnapshotAsync();
        var occupied = bookings.Documents
            .Select(document => document.ConvertTo<Booking>())
            .Select(booking => (booking.DoctorId, booking.Date, booking.Time))
            .ToHashSet();

        foreach (var doctor in doctors)
        {
            doctor.AvailableSlots = doctor.AvailableSlots
                .Select(slot => (slot.Key, Times: slot.Value
                    .Where(time => !occupied.Contains((doctor.Id, slot.Key, time))).ToList()))
                .Where(slot => slot.Times.Count > 0)
                .ToDictionary(slot => slot.Key, slot => slot.Times);
        }

        return doctors;
    }
}
