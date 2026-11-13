// ==========================================================
// File: main.js
// Purpose: page-wide behaviour that isn't tied to one specific tab - tab switching, the profile
// dropdown, and toast notifications - plus small shared helpers (escapeHtml, attachImageFallback)
// and it boots the page.
// Load order: this file MUST load last (see index.html): it calls renderSpecialtyGrid() and
// loadTopRatedDoctors() (both defined in doctors.js) at the very bottom, so those functions must
// already be defined by the time this file runs.
// ==========================================================
// main.js
// المسؤولية: الحاجات العامة اللي مش مرتبطة بصفحة معينة (التنقل بين التابات، قائمة البروفايل،
// رسائل الـ Toast)، وهو كمان نقطة التشغيل الأولى للموقع (بيتحمل آخر ملف في index.html)
// + دوال مساعدة مشتركة صغيرة (escapeHtml لتأمين النصوص، attachImageFallback لبديل الصور المكسورة)
// ==========================================================

// ==========================================================
// Shows a success/error toast for 3 seconds. Used by doctors.js, bookings.js, and feedback.js.
// ==========================================================
// الـ Toast (رسائل النجاح/الخطأ) - بتتستخدم من doctors.js و bookings.js و feedback.js
// ==========================================================
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    // بتختفي لوحدها بعد 3 ثواني
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================================
// Escapes HTML special characters so any text (from the API or typed by the user) can be placed
// inside an innerHTML template without being interpreted as markup (prevents XSS).
// Used by doctors.js and bookings.js for every dynamic value they render.
// ==========================================================
// تأمين النصوص قبل ما تتحط جوه innerHTML: بتحوّل الرموز الخاصة (< > & " ') لنص عادي
// عشان أي بيانات جاية من السيرفر أو من المستخدم متتنفذش كـ HTML/JavaScript (حماية من XSS)
// بتتستخدم في doctors.js و bookings.js لكل قيمة ديناميكية بتتعرض
// ==========================================================
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ==========================================================
// Inline placeholder avatar (an SVG data URI, so it needs no network request) and a helper that
// swaps any <img> that fails to load to it. Used for doctor photos and the profile picture.
// ==========================================================
// صورة بديلة جاهزة جوه الكود (SVG مش محتاجة أي طلب شبكة) + دالة بتبدّل أي صورة مكسورة بيها
// بتتستخدم لصور الدكاترة وصورة البروفايل
// ==========================================================
const DEFAULT_AVATAR_SRC = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#d9e3f6"/><circle cx="40" cy="31" r="14" fill="#737686"/><path d="M12 80c0-17 12-27 28-27s28 10 28 27z" fill="#737686"/></svg>'
);

// Swaps a broken <img> to the placeholder (once, so a failing placeholder can never loop).
function attachImageFallback(img) {
    const useFallback = () => {
        img.src = DEFAULT_AVATAR_SRC;
    };
    img.addEventListener("error", useFallback, { once: true });
    // The browser may have already failed this image before this script ran (static <img> in index.html)
    if (img.complete && img.naturalWidth === 0) {
        useFallback();
    }
}

// ==========================================================
// Switches the visible tab (Home / Doctors / My Bookings / Feedback) and updates nav styling.
// Refreshes the bookings list from the server whenever the "bookings" tab is opened.
// ==========================================================
// التنقل بين التابات (Home / Doctors / My Bookings / Feedback)
// ==========================================================
function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach((section) => {
        section.classList.remove("active-section");
        section.classList.add("hidden-section");
    });

    const target = document.getElementById(tabId);
    if (target) {
        target.classList.remove("hidden-section");
        target.classList.add("active-section");
    }

    // تحديث شكل زرار الناف بار المفعّل
    document.querySelectorAll(".nav-btn").forEach((btn) => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("text-primary", isActive);
        btn.classList.toggle("border-b-2", isActive);
        btn.classList.toggle("border-primary", isActive);
        btn.classList.toggle("text-on-surface-variant", !isActive);
    });

    // نفس تفعيل الزرار لكن للـ Bottom Bar بتاع الموبايل (ليه كلاس خاص، وشكله متعرّف في style.css)
    document.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // التابات بتتبدّل من غير تحميل صفحة جديدة، فبنرجّع الصفحة لأولها مع كل تاب
    window.scrollTo({ top: 0 });

    // كل مرة ندخل على "My Bookings"، نجيب أحدث نسخة من الحجوزات من السيرفر
    // loadBookings() معرّفة في bookings.js
    if (tabId === "bookings") {
        loadBookings();
    }
}

// أي زرار عليه data-tab (في الناف بار أو زرار "View All") بيغير التاب
document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ==========================================================
// Profile dropdown: toggles open on button click, closes on any other click on the page.
// ==========================================================
// قائمة البروفايل المنسدلة
// ==========================================================
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");

// The profile picture is hosted externally; fall back to the inline placeholder if it fails to load.
// صورة البروفايل مستضافة برّه الموقع، فلو ماتحمّلتش بنبدلها بالصورة الجاهزة
attachImageFallback(profileBtn.querySelector("img"));

profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden-dropdown");
});
document.addEventListener("click", () => {
    profileDropdown.classList.add("hidden-dropdown");
});

// ==========================================================
// Initial page boot - the first real calls that make the page show live data.
// Both functions are defined in doctors.js, which loads before this file.
// ==========================================================
// التشغيل الأولي لما الصفحة تفتح
// renderSpecialtyGrid() و loadTopRatedDoctors() معرّفين في doctors.js
// ==========================================================
renderSpecialtyGrid();
loadTopRatedDoctors();
