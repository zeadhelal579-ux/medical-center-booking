// ==========================================================
// File: DoctorsController.cs
// Purpose: HTTP entry point for everything doctor-related. Routes: GET /api/doctors,
// GET /api/doctors/specialty/{specialty}, POST /api/doctors/{id}/rate.
// Logic: this class only translates HTTP requests into IDoctorService calls and HTTP responses
// back - it contains zero business logic itself (see DoctorService for that), per separation
// of concerns. The constructor takes the interface, not the concrete class, for dependency injection.
// ==========================================================

using MedCarePortal.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedCarePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        // Dependency-injected constructor - receives the interface, never the concrete class.
        public DoctorsController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        // GET /api/doctors - all doctors, used by the Home tab.
        [HttpGet]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _doctorService.GetAllDoctorsAsync();
            return Ok(doctors);
        }

        // GET /api/doctors/specialty/{specialty} - used by the Doctors tab after picking a specialty.
        [HttpGet("specialty/{specialty}")]
        public async Task<IActionResult> GetDoctorsBySpecialty(string specialty)
        {
            var doctors = await _doctorService.GetDoctorsBySpecialtyAsync(specialty);
            return Ok(doctors);
        }

        // POST /api/doctors/{id}/rate - body is a raw integer (e.g. 5), not a JSON object.
        [HttpPost("{id}/rate")]
        public async Task<IActionResult> RateDoctor(string id, [FromBody] int rating)
        {
            if (id.Length > 150 || id.Contains('/'))
            {
                return BadRequest(new { message = "Invalid record ID." });
            }

            if (rating < 1 || rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5 stars." });
            }

            var success = await _doctorService.RateDoctorAsync(id, rating);

            if (!success)
            {
                return NotFound(new { message = "Doctor not found." });
            }

            return Ok(new { message = "Rating submitted successfully." });
        }
    }
}
