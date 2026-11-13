// ==========================================================
// File: IBookingService.cs
// Purpose: Contract for all booking-related business logic.
// Logic: CreateBookingAsync returns a (bool, string) result instead of throwing, so
// BookingsController can turn a business rule failure (e.g. double-booking) into a clean
// 400 response without exception-based control flow.
// ==========================================================

using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services
{
    public interface IBookingService
    {
        // Returns every booking for every patient (no per-patient filtering yet - see Known Limitations).
        Task<List<Booking>> GetAllBookingsAsync();

        // Validates the doctor exists and the slot is free, then creates the booking.
        Task<(bool IsSuccess, string ErrorMessage)> CreateBookingAsync(Booking booking);

        // Deletes a booking by ID; false if it did not exist.
        Task<bool> CancelBookingAsync(string bookingId);
    }
}
