// ==========================================================
// File: IFeedbackService.cs
// Purpose: Contract for feedback-related business logic.
// Logic: kept minimal on purpose - feedback has no update/delete workflow yet, only submit and list.
// ==========================================================

using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services
{
    public interface IFeedbackService
    {
        // Returns every feedback entry submitted so far (for the future admin view).
        Task<List<Feedback>> GetAllFeedbackAsync();

        // Stamps the submission time and saves a new feedback entry.
        Task AddFeedbackAsync(Feedback feedback);
    }
}
