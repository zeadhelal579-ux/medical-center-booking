// ==========================================================
// File: BookingsController.cs
// Purpose: HTTP entry point for everything booking-related. Routes: GET /api/bookings,
// POST /api/bookings, DELETE /api/bookings/{id}.
// Logic: model binding + [Required] on Booking already rejects incomplete requests with 400 before
// this class's code even runs (see ModelState.IsValid below); anything past that point is handled
// by BookingService, including the "doctor not found" and "slot already booked" business rules.
// Implementation note: the success response for POST includes the full saved Booking object (not
// just a message) - the frontend does not currently read it, but this keeps the contract ready for
// a future "update the screen without reloading" feature.
// ==========================================================

using MedCarePortal.API.Models;
using MedCarePortal.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedCarePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        // Dependency-injected constructor - receives the interface, never the concrete class.
        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET /api/bookings - every booking for every patient (see Known Limitations: no per-patient filter yet).
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        // POST /api/bookings - body: { doctorId, patientName, date, time }.
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (booking.DoctorId.Contains('/'))
            {
                return BadRequest(new { message = "Invalid doctor ID." });
            }

            var (isSuccess, errorMessage) = await _bookingService.CreateBookingAsync(booking);

            if (!isSuccess)
            {
                return BadRequest(new { message = errorMessage });
            }

            return Ok(new { message = "Booking created successfully.", booking });
        }

        // DELETE /api/bookings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(string id)
        {
            if (id.Length > 150 || id.Contains('/'))
            {
                return BadRequest(new { message = "Invalid record ID." });
            }

            var success = await _bookingService.CancelBookingAsync(id);

            if (!success)
            {
                return NotFound(new { message = "Booking not found." });
            }

            return Ok(new { message = "Booking cancelled successfully." });
        }
    }
}
