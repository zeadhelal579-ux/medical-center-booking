// ==========================================================
// File: api.js
// Purpose: Single shared entry point for every network call this frontend makes.
// Logic: wraps fetch() with JSON headers, JSON parsing, and consistent error handling so the
// other four files never call fetch() directly - they all call apiRequest() instead.
// Load order: this file MUST load first (see index.html) because every other JS file depends on
// apiRequest() and API_BASE_URL being defined already.
// ==========================================================
// api.js
// المسؤولية: نقطة الاتصال الوحيدة المشتركة لأي طلب شبكة بيعمله الفرونت إند
// بيغلف fetch() بالـ JSON headers والتحويل لـ JSON ومعالجة الأخطاء بشكل موحّد، عشان باقي
// الأربع ملفات ميستخدموش fetch() مباشرة أبداً - كلهم بينادوا apiRequest() بدالها
// ترتيب التحميل: الملف ده لازم يتحمّل الأول (شوف index.html) لأن كل ملف تاني بيعتمد على إن
// apiRequest() و API_BASE_URL معرّفين قبله
// ==========================================================

const LOCAL_API_URL = "http://localhost:62114/api";
const PRODUCTION_API_URL = document.querySelector('meta[name="clinic-api-url"]')?.content;
const IS_LOCAL_HOST = ["localhost", "127.0.0.1", "[::1]", ""].includes(window.location.hostname);
const API_BASE_URL = PRODUCTION_API_URL || (IS_LOCAL_HOST ? LOCAL_API_URL : "");
const IS_DEMO_MODE = !API_BASE_URL || new URLSearchParams(window.location.search).get("demo") === "1";
// No real login system yet, so every request is sent as this fixed mock patient.
// لسه مفيش نظام تسجيل دخول حقيقي، فكل طلب بيتبعت باسم المريض التجريبي الثابت ده
const CURRENT_PATIENT_NAME = "John Doe";

// ==========================================================
// Generic fetch wrapper: builds the request, parses JSON, and throws a readable Error on failure.
// ==========================================================
// دالة عامة بتغلف fetch: بتجهز الطلب، بتحوّل الرد لـ JSON، وبترمي Error برسالة واضحة لو فشل
// ==========================================================
async function apiRequest(endpoint, method = "GET", body = null) {
    if (IS_DEMO_MODE) {
        return requestDemoApi(endpoint, method, body);
    }

    try {
        const options = { method, headers: {} };
        if (body !== null) {
            // Content-Type is sent only when there is a body, so body-less GETs stay "simple" CORS requests (no preflight round trip).
            // الـ Content-Type بيتبعت بس لو فيه Body، عشان طلبات الـ GET تفضل "بسيطة" ومتحتاجش Preflight (طلب OPTIONS زيادة) مع Render
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null; // الرد ممكن يجيله من غير Body خالص (زي بعض ردود النجاح) - ده مش خطأ
        }

        if (!response.ok) {
            const message = data?.message || data?.title || "Something went wrong. Please try again.";
            throw new Error(message);
        }

        return data;
    } catch (err) {
        if (err instanceof TypeError) {
            // الباك إند أصلاً مش شغال أو مش قادر يتوصله، مش مجرد رد فيه خطأ من السيرفر
            // على Render المجاني السيرفر بينام بعد فترة خمول، وأول طلب بعدها ممكن ياخد وقت لحد ما يصحى
            throw new Error("Cannot connect to the server. It may be waking up - please try again in a few seconds.");
        }
        throw err;
    }
}
