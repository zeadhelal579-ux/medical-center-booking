// ==========================================================
// File: Doctor.cs
// Purpose: Data model for a single doctor document stored in the Firestore "Doctors" collection.
// Logic: [FirestoreData] lets Google.Cloud.Firestore convert this class to/from a Firestore
// document automatically. [FirestoreDocumentId] marks the document's own ID (not stored as a
// field inside the document); every other property is a [FirestoreProperty] field.
// Implementation: AvailableSlots models a day -> list-of-times map, e.g.
// { "Today": ["10:00 AM", "11:30 AM"], "Tomorrow": ["09:00 AM"] }, exactly as the frontend expects it.
// ==========================================================

using Google.Cloud.Firestore;

namespace MedCarePortal.API.Models
{
    [FirestoreData]
    public class Doctor
    {
        // The Firestore document ID; not persisted as a field inside the document itself.
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Name { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Specialty { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Focus { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ClinicLocation { get; set; } = string.Empty;

        // Doctor photo shown on the doctor card in the frontend.
        [FirestoreProperty]
        public string ImageUrl { get; set; } = string.Empty;

        [FirestoreProperty]
        public int PatientsCount { get; set; }

        [FirestoreProperty]
        public double Rating { get; set; }

        // Number of ratings submitted so far; used to compute the running average in DoctorService.
        [FirestoreProperty]
        public int RatingCount { get; set; }

        // Day -> available time slots, e.g. { "Today": ["10:00 AM"], "Tomorrow": ["09:00 AM"] }.
        [FirestoreProperty]
        public Dictionary<string, List<string>> AvailableSlots { get; set; } = new();
    }
}
