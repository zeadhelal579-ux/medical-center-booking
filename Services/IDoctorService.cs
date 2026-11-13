// ==========================================================
// File: IDoctorService.cs
// Purpose: Contract for all doctor-related business logic.
// Logic: Controllers depend on this interface (not on DoctorService directly), so the
// implementation can be swapped - e.g. for a test double - without touching DoctorsController.
// ==========================================================

using MedCarePortal.API.Models;

namespace MedCarePortal.API.Services
{
    public interface IDoctorService
    {
        // Returns every doctor in the collection.
        Task<List<Doctor>> GetAllDoctorsAsync();

        // Returns only doctors whose Specialty matches exactly.
        Task<List<Doctor>> GetDoctorsBySpecialtyAsync(string specialty);

        // Adds a new 1-5 star rating and recalculates the running average. False if the doctor doesn't exist.
        Task<bool> RateDoctorAsync(string doctorId, int newRating);

    }
}
