// ==========================================================
// File: feedback.js
// Purpose: handles the Feedback form only - reads its fields, does a quick client-side check,
// and submits it to the backend.
// Cross-file calls: uses apiRequest() and CURRENT_PATIENT_NAME from api.js, and showToast()
// from main.js.
// ==========================================================
// feedback.js
// المسؤولية: التعامل مع فورمة "Feedback" بس - قراءة البيانات، التحقق البسيط، وإرسالها للباك إند
// بيستخدم apiRequest() من api.js و showToast() من main.js
// ==========================================================

// Submit handler: validates the required "Suggestion" field, then POSTs to /api/feedback.
document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // بيمنع الصفحة من الـ Refresh التلقائي عند الـ Submit

    const suggestion = document.getElementById("feedbackSuggestion").value.trim();

    // فحص بسيط جوه الفرونت إند قبل ما نتعب نبعت للباك إند أصلاً
    // (الباك إند برضه بيرفضها لو فاضية بفضل [Required]، ده بس بيوفر رحلة الطلب من غير داعي)
    if (!suggestion) {
        showToast("Suggestion field is required.", "error");
        return;
    }

    try {
        const res = await apiRequest("/feedback", "POST", {
            patientName: document.getElementById("feedbackName").value,
            complaint: document.getElementById("feedbackComplaint").value.trim(),
            suggestion: suggestion,
        });

        showToast(res.message || "Feedback submitted successfully.", "success");

        document.getElementById("feedbackForm").reset();
        // خانة الاسم "readonly" فبنرجعها يدوي بعد الـ reset لأنها مش هتترجع لوحدها للقيمة الافتراضية بشكل مضمون
        document.getElementById("feedbackName").value = CURRENT_PATIENT_NAME;
    } catch (err) {
        showToast(err.message, "error");
    }
});
