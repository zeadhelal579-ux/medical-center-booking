// Supplies fictional clinic records and handles demo requests in memory.
const requestDemoApi = (() => {
    const doctors = DEMO_DOCTORS;

    let nextBookingId = 1;
    const ratings = new Map();
    const bookings = [
        createBookingRecord(doctors[0], "Today", "10:00 AM"),
        createBookingRecord(doctors[4], "Tomorrow", "2:30 PM"),
        createBookingRecord(doctors[7], "Tomorrow", "9:00 AM"),
        createBookingRecord(doctors[11], "Today", "2:30 PM"),
    ];

    function createBookingRecord(doctor, date, time) {
        return {
            id: `demo-booking-${nextBookingId++}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date,
            time,
        };
    }

    function hasBooking(doctorId, date, time) {
        return bookings.some((booking) =>
            booking.doctorId === doctorId && booking.date === date && booking.time === time
        );
    }

    function getDoctorCard(doctor) {
        const availableSlots = Object.fromEntries(
            Object.entries(doctor.availableSlots)
                .map(([date, times]) => [date, times.filter((time) => !hasBooking(doctor.id, date, time))])
                .filter(([, times]) => times.length > 0)
        );
        const visitorRating = ratings.get(doctor.id);
        if (visitorRating === undefined) return { ...doctor, availableSlots };

        const ratingCount = doctor.ratingCount + 1;
        const rating = (doctor.rating * doctor.ratingCount + visitorRating) / ratingCount;
        return { ...doctor, availableSlots, rating, ratingCount, visitorRating };
    }

    function bookAppointment({ doctorId, date, time }) {
        const doctor = doctors.find(({ id }) => id === doctorId);
        if (!doctor?.availableSlots[date]?.includes(time) || hasBooking(doctorId, date, time)) {
            throw new Error("This appointment time is no longer available.");
        }
        bookings.push(createBookingRecord(doctor, date, time));
        return { message: "Demo booking confirmed." };
    }

    function cancelAppointment(bookingId) {
        const index = bookings.findIndex(({ id }) => id === bookingId);
        if (index === -1) {
            throw new Error("This booking could not be found.");
        }
        bookings.splice(index, 1);
        return { message: "Demo booking cancelled." };
    }

    function rateDoctor(doctorId, rating) {
        if (!doctors.some(({ id }) => id === doctorId)) {
            throw new Error("This doctor could not be found.");
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error("Select a rating from 1 to 5.");
        }
        ratings.set(doctorId, rating);
        return { message: "Demo rating recorded." };
    }

    return function request(endpoint, method, body) {
        const [, resource, id, action] = endpoint.split("/");
        if (method === "GET" && endpoint === "/doctors") return doctors.map(getDoctorCard);
        if (method === "GET" && resource === "doctors" && id === "specialty") {
            return doctors.filter(({ specialty }) => specialty === decodeURIComponent(action)).map(getDoctorCard);
        }
        if (method === "POST" && resource === "doctors" && action === "rate") return rateDoctor(id, body);
        if (method === "GET" && endpoint === "/bookings") return bookings.map((booking) => ({ ...booking }));
        if (method === "POST" && endpoint === "/bookings") return bookAppointment(body);
        if (method === "DELETE" && resource === "bookings" && id) return cancelAppointment(id);
        if (method === "POST" && endpoint === "/feedback") return { message: "Demo feedback received." };
        throw new Error("This action is unavailable in demo mode.");
    };
})();
