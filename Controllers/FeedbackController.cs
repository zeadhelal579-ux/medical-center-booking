// ==========================================================
// File: FeedbackController.cs
// Purpose: HTTP entry point for feedback. Routes: GET /api/feedback, POST /api/feedback.
// Logic: [Required] on Feedback.PatientName and Feedback.Suggestion means ModelState.IsValid
// already blocks any submission missing either one before AddFeedbackAsync is ever called.
// ==========================================================

using MedCarePortal.API.Models;
using MedCarePortal.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedCarePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        // Dependency-injected constructor - receives the interface, never the concrete class.
        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // GET /api/feedback - for a future admin view; not called by the patient frontend today.
        [HttpGet]
        public async Task<IActionResult> GetAllFeedback()
        {
            var feedbacks = await _feedbackService.GetAllFeedbackAsync();
            return Ok(feedbacks);
        }

        // POST /api/feedback - body: { patientName, complaint (optional), suggestion }.
        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] Feedback feedback)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _feedbackService.AddFeedbackAsync(feedback);

            return Ok(new { message = "Feedback submitted successfully. Thank you!" });
        }
    }
}
