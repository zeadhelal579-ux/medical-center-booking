// ==========================================================
// File: Booking.cs
// Purpose: Data model for a single appointment document in the Firestore "Bookings" collection.
// Logic: [Required] properties are validated by ASP.NET Core's ModelState before a controller
// method body ever runs, so the service layer never has to re-check them. DoctorName, Specialty
// and CreatedAt are intentionally NOT sent by the frontend - BookingService fills them in from the
// doctor record and the server clock, so a client can never fake or skip them.
// Implementation: Date/Time are plain strings (not DateTime) because the frontend sends slot
// labels straight from Doctor.AvailableSlots (e.g. date can literally be the string "Today").
// ==========================================================

using Google.Cloud.Firestore;
using System.ComponentModel.DataAnnotations;

namespace MedCarePortal.API.Models
{
    [FirestoreData]
    public class Booking
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "Doctor ID is required.")]
        [FirestoreProperty]
        [StringLength(150)]
        public string DoctorId { get; set; } = string.Empty;

        // Filled in by BookingService from the doctor record, not supplied by the client.
        [FirestoreProperty]
        public string DoctorName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Specialty { get; set; } = string.Empty;

        [Required(ErrorMessage = "Patient name is required.")]
        [FirestoreProperty]
        [StringLength(120)]
        public string PatientName { get; set; } = string.Empty;

        // Example value: "Today" (a slot label) or a real date string like "2026-08-01".
        [Required(ErrorMessage = "Booking date is required.")]
        [FirestoreProperty]
        [StringLength(80)]
        public string Date { get; set; } = string.Empty;

        // Example value: "10:00 AM".
        [Required(ErrorMessage = "Booking time is required.")]
        [FirestoreProperty]
        [StringLength(80)]
        public string Time { get; set; } = string.Empty;

        // Set by BookingService at creation time, not supplied by the client.
        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
