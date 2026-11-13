# Clinic Frontend for Vercel

واجهة MedCare Portal للنشر، مع وضع Demo مستقل. الديمو يعرض 16 طبيبًا وهميًا في خمسة تخصصات وأربعة حجوزات جاهزة. التقييم قابل للتعديل في الجلسة، والتغييرات تُمسح عند تحديث الصفحة. Feedback في الديمو محاكاة داخل المتصفح.

## التشغيل المحلي

استخدم Node.js 22 أو 24. من جذر فرع `front-Deploy` نفّذ الآتي.

```powershell
npm ci
npm run build
python -m http.server 5501 --bind 127.0.0.1 --directory dist
```

افتح `http://127.0.0.1:5501/?demo=1` للديمو. العنوان نفسه بدون `?demo=1` يتصل محليًا بـ`http://localhost:62114/api` ما لم تضبط عنوان API في البناء.

## إعداد Vercel

اختَر فرع `front-Deploy` للإنتاج واترك **Root Directory** على جذر المشروع. إعداد `vercel.json` يستخدم `npm ci` و`npm run build` ويقدّم `dist`.

- اترك `PRODUCTION_API_URL` غير مضبوط لنشر الديمو العام المستقل.
- لتجربة الاتصال على بيئة اختبار، اضبط `PRODUCTION_API_URL` على عنوان HTTPS ينتهي بـ`/api`، وأضف أصل الواجهة إلى CORS في الباك، ثم أعد النشر. عنوان الـAPI عام ومضمّن في HTML.
- بعد النشر افتح الصفحة وتحقق من ظهور الأطباء، وجرّب الحجز والإلغاء والتقييم وFeedback ببيانات وهمية.
