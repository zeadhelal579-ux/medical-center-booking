// ==========================================================
// File: doctors.js
// Purpose: Everything related to showing doctors - the Home tab's "Top Rated" list, the Doctors
// tab's specialty picker + booking grid, and the search bar's results.
// Logic: fetches doctor data via apiRequest() (api.js) and renders it with one shared card
// builder (createDoctorCard) that switches between a "rate" view and a "book a slot" view.
// Cross-file calls: uses showToast() and switchTab() from main.js, and calls createBooking()
// from bookings.js when a patient clicks an available time slot.
// ==========================================================
// doctors.js
// المسؤولية: كل حاجة متعلقة بعرض الدكاترة - الهوم (Top Rated) وصفحة Doctors (التخصصات + الحجز)
// والبحث. بيستخدم apiRequest() من api.js، وبيستدعي createBooking() من bookings.js
// لما حد يدوس على ميعاد متاح (التعريف الفعلي لـ createBooking موجود في bookings.js)
// ==========================================================

// قائمة التخصصات الثابتة (نفس الموجودة في الهوم) - بنستخدمها في أكتر من مكان في الصفحة
const SPECIALTIES = [
    { name: "Dentist", emoji: "🦷" },
    { name: "Orthopedics", emoji: "🦴" },
    { name: "Ophthalmology", emoji: "👁️" },
    { name: "Neurology", emoji: "🧠" },
    { name: "Cardiology", emoji: "❤️" },
];

// بنحتفظ هنا بنسخة من كل الدكاترة اللي جبناهم من السيرفر، عشان البحث يستخدمهم
// من غير ما يعمل نداء جديد للسيرفر كل مرة
let allDoctorsCache = [];

// ==========================================================
// Builds one reusable doctor card, used by Top Rated, the Doctors grid, and Search Results.
// Directory and search cards also show bookable time slots.
// ==========================================================
// بناء كارت الدكتور (Reusable) - بيتستخدم في "Top Rated" و "Doctors Grid" و "Search Results"
// كروت البحث والتخصصات بتعرض المواعيد المتاحة كمان.
// ==========================================================
function createDoctorCard(doctor, { showBookingSlots = false } = {}) {
    const card = document.createElement("div");
    card.className = "bg-surface-container-lowest rounded-2xl shadow-ambient p-6 flex flex-col gap-4";

    // الجزء العلوي: صورة + اسم + تخصص (مشترك في كل الأحوال)
    const header = document.createElement("div");
    header.className = "flex items-center gap-4 border-b border-surface-variant pb-4";
    const average = Number(doctor.rating);
    const ratingLabel = average > 0
        ? `<span class="text-amber-700" aria-hidden="true">★</span> ${average.toFixed(1)}<span class="sr-only"> out of 5 stars</span>${doctor.ratingCount ? ` · ${escapeHtml(doctor.ratingCount)} ratings` : ""}`
        : "New to the clinic";
    header.innerHTML = `
    <img src="${escapeHtml(doctor.imageUrl || DEFAULT_AVATAR_SRC)}" alt="${escapeHtml(doctor.name)}"
         width="72" height="72" class="h-[72px] w-[72px] shrink-0 rounded-2xl object-cover"/>
    <div>
      <h3 class="text-lg font-bold text-on-surface">${escapeHtml(doctor.name)}</h3>
      <p class="text-sm text-primary font-semibold">${escapeHtml(doctor.specialty)}</p>
      ${doctor.focus ? `<p class="text-xs text-on-surface-variant">${escapeHtml(doctor.focus)}</p>` : ""}
      <p class="mt-1 text-xs font-semibold text-on-surface-variant">${ratingLabel}</p>
    </div>
  `;
    attachImageFallback(header.querySelector("img")); // attachImageFallback معرّفة في main.js - بتبدّل أي صورة مكسورة بصورة جاهزة
    card.appendChild(header);

    if (showBookingSlots) {
        // ---------- وضع صفحة "Doctors": عرض العيادة + المواعيد المتاحة ----------
        const body = document.createElement("div");
        body.innerHTML = `
      <p class="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
        <span class="material-symbols-outlined" style="font-size:14px;">location_on</span> ${escapeHtml(doctor.clinicLocation || "Not specified")}
      </p>
      <h4 class="text-sm font-semibold text-on-surface mb-2">Available Slots</h4>
    `;

        const slotsWrapper = document.createElement("div");
        slotsWrapper.className = "space-y-3";

        const slots = doctor.availableSlots || {};
        const dayKeys = Object.keys(slots);

        if (dayKeys.length === 0) {
            slotsWrapper.innerHTML = `<p class="text-xs text-on-surface-variant">No available slots right now.</p>`;
        } else {
            dayKeys.forEach((day) => {
                const dayRow = document.createElement("div");
                const times = slots[day] || [];
                const buttonsHtml = times
                    .map((time) => `<button class="slot-btn" data-day="${escapeHtml(day)}" data-time="${escapeHtml(time)}">${escapeHtml(time)}</button>`)
                    .join("");
                dayRow.innerHTML = `
          <p class="text-xs text-on-surface-variant mb-1">${escapeHtml(day)}</p>
          <div class="flex flex-wrap gap-2">${buttonsHtml}</div>
        `;
                slotsWrapper.appendChild(dayRow);
            });
        }

        body.appendChild(slotsWrapper);
        card.appendChild(body);

        // كل زرار وقت لما ندوس عليه، بيعمل الحجز فوراً
        // ⭐ createBooking() معرّفة في bookings.js - شغالة هنا لأن bookings.js متحمّل قبل ما أي زرار يتدوس عليه فعلياً
        slotsWrapper.querySelectorAll(".slot-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                btn.disabled = true;
                try {
                    if (await createBooking(doctor.id, btn.dataset.day, btn.dataset.time)) {
                        await refreshDoctorLists();
                    }
                } finally {
                    btn.disabled = false;
                }
            });
        });
    }

    const rateButton = document.createElement("button");
    rateButton.type = "button";
    rateButton.dataset.rateDoctor = doctor.id;
    rateButton.className = "mt-auto rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold text-primary hover:bg-surface-container-low";
    rateButton.textContent = doctor.visitorRating ? "Edit your rating" : "Rate your visit";
    rateButton.addEventListener("click", () => openRatingDialog(doctor, rateButton));
    card.appendChild(rateButton);

    return card;
}

// ==========================================================
// Home tab: fetches all doctors, sorts by rating, and renders the top six.
// ==========================================================
// صفحة الهوم: جلب وعرض "Top Rated Doctors"
// ==========================================================
async function loadTopRatedDoctors() {
    const container = document.getElementById("topRatedDoctors");
    try {
        const doctors = await apiRequest("/doctors");
        allDoctorsCache = doctors; // بنخزنهم عشان البحث يستخدمهم من غير نداء جديد

        renderSpecialtyGrid();
        container.innerHTML = "";
        if (doctors.length === 0) {
            container.innerHTML = `<p class="text-on-surface-variant col-span-full text-center py-6">No doctors found yet. Add some in Firestore first.</p>`;
            return;
        }

        // بنرتب حسب أعلى تقييم ونعرض أول 6 بس في الهوم
        const topDoctors = [...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
        topDoctors.forEach((doc) => container.appendChild(createDoctorCard(doc, { showBookingSlots: false })));
    } catch (err) {
        container.innerHTML = `<p class="text-error col-span-full text-center py-6">${escapeHtml(err.message)}</p>`;
    }
}

// ==========================================================
// Doctors tab: renders the specialty picker grid, then (on click) the chosen specialty's doctors.
// ==========================================================
// صفحة Doctors: عرض كروت التخصصات، وبعدين دكاترة التخصص المختار
// ==========================================================
// Renders one button per specialty; clicking a button loads that specialty's doctors.
function renderSpecialtyGrid() {
    const grid = document.getElementById("specialtyGrid");
    grid.innerHTML = "";
    SPECIALTIES.forEach((s) => {
        const count = allDoctorsCache.filter((doctor) => doctor.specialty === s.name).length;
        const btn = document.createElement("button");
        btn.className = "bg-surface-container-lowest rounded-2xl shadow-ambient p-6 text-center hover:ring-2 hover:ring-primary transition";
        btn.innerHTML = `<span class="text-4xl block mb-2">${s.emoji}</span><span class="text-sm font-semibold text-on-surface">${s.name}</span>${count ? `<span class="mt-1 block text-xs text-on-surface-variant">${count} doctors</span>` : ""}`;
        btn.addEventListener("click", () => loadDoctorsBySpecialty(s.name));
        grid.appendChild(btn);
    });
}

// Fetches doctors for one specialty and renders them in booking-slot mode.
async function loadDoctorsBySpecialty(specialty) {
    const specialtiesView = document.getElementById("specialties-view");
    const doctorsGridView = document.getElementById("doctors-grid-view");
    const doctorsGrid = document.getElementById("doctorsGrid");
    doctorsGrid.dataset.specialty = specialty;

    specialtiesView.classList.add("hidden-section");
    doctorsGridView.classList.remove("hidden-section");
    doctorsGrid.innerHTML = `<p class="text-on-surface-variant col-span-full text-center py-6">Loading...</p>`;

    try {
        const doctors = await apiRequest(`/doctors/specialty/${encodeURIComponent(specialty)}`);
        doctorsGrid.innerHTML = "";
        if (doctors.length === 0) {
            doctorsGrid.innerHTML = `<p class="text-on-surface-variant col-span-full text-center py-6">No doctors available for ${escapeHtml(specialty)} yet.</p>`;
            return;
        }
        doctors.forEach((doc) => doctorsGrid.appendChild(createDoctorCard(doc, { showBookingSlots: true })));
    } catch (err) {
        doctorsGrid.innerHTML = `<p class="text-error col-span-full text-center py-6">${escapeHtml(err.message)}</p>`;
    }
}

// ==========================================================
// Search bar: client-side filter over the doctors already cached from the last /api/doctors call.
// ==========================================================
// البحث (Search Bar) - فلترة محلية (Client-side) على الدكاترة المتخزنين في الكاش
// ==========================================================
function runSearch(term) {
    if (!term) return;

    switchTab("doctors"); // switchTab معرّفة في main.js
    document.getElementById("specialties-view").classList.remove("hidden-section");
    document.getElementById("doctors-grid-view").classList.add("hidden-section");

    renderSearchResults(term);
}

function renderSearchResults(term) {
    const resultsView = document.getElementById("searchResultsView");
    const resultsGrid = document.getElementById("searchResultsGrid");
    resultsGrid.dataset.term = term;
    resultsView.classList.remove("hidden-section");

    const lowerTerm = term.toLowerCase();
    const matches = allDoctorsCache.filter(
        (d) => (d.name || "").toLowerCase().includes(lowerTerm) || (d.specialty || "").toLowerCase().includes(lowerTerm) || (d.focus || "").toLowerCase().includes(lowerTerm)
    );

    resultsGrid.innerHTML = "";
    if (matches.length === 0) {
        resultsGrid.innerHTML = `<p class="text-on-surface-variant col-span-full text-center py-6">No results for "${escapeHtml(term)}".</p>`;
        return;
    }
    matches.forEach((doc) => resultsGrid.appendChild(createDoctorCard(doc, { showBookingSlots: true })));
}

async function refreshDoctorLists() {
    await loadTopRatedDoctors();
    const { term } = document.getElementById("searchResultsGrid").dataset;
    if (term) renderSearchResults(term);

    if (!document.getElementById("doctors-grid-view").classList.contains("hidden-section")) {
        await loadDoctorsBySpecialty(document.getElementById("doctorsGrid").dataset.specialty);
    }
}

// ==========================================================
// Wires up static page elements. Safe to run at top level (not inside DOMContentLoaded)
// because these <script> tags are placed at the end of <body>, after the DOM they reference.
// ==========================================================
// ربط عناصر الصفحة الخاصة بالدكاترة بالأحداث (Event Listeners)
// ==========================================================

// زرار "Back to Specialties" في صفحة Doctors
document.getElementById("backToSpecialtiesBtn").addEventListener("click", () => {
    document.getElementById("doctors-grid-view").classList.add("hidden-section");
    document.getElementById("specialties-view").classList.remove("hidden-section");
});

// كاتيجوريز الهوم بتودي مباشرة لتاب Doctors مفلترة على التخصص اللي اتدوس عليه
document.querySelectorAll(".specialty-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
        switchTab("doctors");
        loadDoctorsBySpecialty(pill.dataset.specialty);
    });
});

document.getElementById("doctorSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(document.getElementById("searchInput").value.trim());
});
