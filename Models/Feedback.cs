// ==========================================================
// File: Feedback.cs
// Purpose: Data model for a single feedback document in the Firestore "Feedbacks" collection.
// Logic: Complaint is optional (the HTML form never marks it "required"); Suggestion is required
// because the HTML form's Suggestion field is "required" too, so the API must reject any submission
// missing it, keeping frontend and backend validation in agreement.
// Implementation: DateSubmitted is a formatted string ("yyyy-MM-dd HH:mm:ss"), set server-side by
// FeedbackService - the client never sends it.
// ==========================================================

using Google.Cloud.Firestore;
using System.ComponentModel.DataAnnotations;

namespace MedCarePortal.API.Models
{
    [FirestoreData]
    public class Feedback
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "Patient name is required.")]
        [FirestoreProperty]
        [StringLength(120)]
        public string PatientName { get; set; } = string.Empty;

        // Optional, matching the original HTML form (no "required" attribute on this field).
        [FirestoreProperty]
        [StringLength(2000)]
        public string? Complaint { get; set; }

        // Required, matching the original HTML form's "required" attribute on this field.
        [Required(ErrorMessage = "Suggestion is required.")]
        [FirestoreProperty]
        [StringLength(2000)]
        public string Suggestion { get; set; } = string.Empty;

        // Set by FeedbackService at submission time, not supplied by the client.
        [FirestoreProperty]
        public string DateSubmitted { get; set; } = string.Empty;
    }
}
