// ==========================================================
// File: FeedbackService.cs
// Purpose: Implements IFeedbackService - the simplest service in the project.
// Logic: DateSubmitted is stamped server-side as "yyyy-MM-dd HH:mm:ss" so every entry has a
// consistent, sortable timestamp regardless of what the client's clock says.
// ==========================================================

using Google.Cloud.Firestore;
using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "Feedbacks";

        // Injects the shared FirestoreDb connection registered as a singleton in Program.cs.
        public FeedbackService(FirestoreDb db)
        {
            _db = db;
        }

        // Fetches every feedback entry in the collection.
        public async Task<List<Feedback>> GetAllFeedbackAsync()
        {
            QuerySnapshot snapshot = await _db.Collection(CollectionName).GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Feedback>()).ToList();
        }

        // Stamps the submission time server-side, then saves the entry with an auto-generated ID.
        public async Task AddFeedbackAsync(Feedback feedback)
        {
            feedback.DateSubmitted = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            CollectionReference feedbackRef = _db.Collection(CollectionName);
            DocumentReference newDoc = feedbackRef.Document();
            feedback.Id = newDoc.Id;

            await newDoc.SetAsync(feedback);
        }
    }
}
