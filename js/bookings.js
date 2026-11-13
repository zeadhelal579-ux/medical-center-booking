// ==========================================================
// File: bookings.js
// Purpose: everything related to bookings - creating one, showing the "My Bookings" list, and
// cancelling a booking.
// Cross-file calls: uses apiRequest() from api.js and showToast() from main.js; createBooking()
// here is in turn called from doctors.js when a patient clicks an available time slot.
// ==========================================================
// bookings.js
// المسؤولية: كل حاجة متعلقة بالحجوزات - إنشاء حجز جديد، عرض صفحة "My Bookings"، وإلغاء حجز
// بيستخدم apiRequest() من api.js و showToast() من main.js
// ==========================================================

// ==========================================================
// Creates a new booking (POST /api/bookings). Called from doctors.js when a slot is clicked.
// ==========================================================
// إنشاء حجز جديد (POST /api/bookings)
// بتتنادى من داخل doctors.js لما المريض يدوس على ميعاد متاح
// ==========================================================
async function createBooking(doctorId, day, time) {
    try {
        const res = await apiRequest("/bookings", "POST", {
            doctorId: doctorId,
            patientName: CURRENT_PATIENT_NAME, // معرّفة في api.js
            date: day, // ملحوظة: القيمة دي هي نفس اسم المفتاح اللي جاي من AvailableSlots (زي "Today")
            time: time,
        });
        showToast(res.message || "Booking confirmed successfully!", "success");
        return true;
    } catch (err) {
        showToast(err.message, "error");
        return false;
    }
}

// ==========================================================
// "My Bookings" tab: fetches and renders bookings, and wires up each Cancel button.
// Called from main.js's switchTab() every time the patient opens the "My Bookings" tab.
// ==========================================================
// صفحة "My Bookings": جلب وعرض الحجوزات + إلغاء حجز
// بتتنادى من main.js كل مرة المريض يدوس على تاب "My Bookings"
// ==========================================================
async function loadBookings() {
    const list = document.getElementById("bookingsList");
    list.innerHTML = `<p class="text-on-surface-variant text-center py-6">Loading bookings...</p>`;

    try {
        const bookings = await apiRequest("/bookings");
        list.innerHTML = "";

        if (bookings.length === 0) {
            list.innerHTML = `<p class="text-on-surface-variant text-center py-6">You have no bookings yet.</p>`;
            return;
        }

        // كل القيم الديناميكية هنا بتعدّي على escapeHtml (معرّفة في main.js): date و time نص حر بيتبعت من العميل،
        // فمينفعش يتعرض كـ HTML خام أبداً (وإلا أي حد يقدر يزرع كود في صفحة كل الزوار)
        bookings.forEach((booking) => {
            const item = document.createElement("div");
            item.className = "flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-variant gap-4";
            item.innerHTML = `
        <div>
          <h3 class="font-semibold text-on-surface">${escapeHtml(booking.doctorName || "Doctor")}</h3>
          <p class="text-sm text-on-surface-variant">${escapeHtml(booking.specialty || "")}</p>
          <p class="text-sm text-on-surface-variant mt-1">${escapeHtml(booking.date)} • ${escapeHtml(booking.time)}</p>
        </div>
        <button class="cancel-booking-btn text-error bg-error-container/20 hover:bg-error-container/40 p-2 rounded-full transition" data-id="${escapeHtml(booking.id)}" aria-label="Cancel appointment" title="Cancel appointment">
          <span class="material-symbols-outlined" style="font-size:20px;">close</span>
        </button>
      `;
            list.appendChild(item);
        });

        // ربط زرار الإلغاء بكل كارت اتعمل دلوقتي (Event Delegation مش لازمة هنا لأن العدد صغير)
        list.querySelectorAll(".cancel-booking-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                btn.disabled = true;
                try {
                    const res = await apiRequest(`/bookings/${encodeURIComponent(btn.dataset.id)}`, "DELETE");
                    showToast(res.message || "Booking cancelled.", "success");
                    await Promise.all([loadBookings(), refreshDoctorLists()]);
                } catch (err) {
                    showToast(err.message, "error");
                } finally {
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        list.innerHTML = `<p class="text-error text-center py-6">${escapeHtml(err.message)}</p>`;
    }
}
