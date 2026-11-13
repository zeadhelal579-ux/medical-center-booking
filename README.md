# Clinic API

ASP.NET Core على .NET 10 مع Cloud Firestore. شغّل الأوامر من جذر الفرع `back-end`.

## التشغيل المحلي

ابدأ Firestore Emulator لمشروع وهمي على `127.0.0.1:8685`، ثم شغّل الآتي في PowerShell.

```powershell
$env:FirebaseProjectId = 'demo-clinic-audit'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8685'
dotnet run --launch-profile http
```

الـAPI متاح على `http://localhost:62114/api`، وSwagger على `http://localhost:62114/swagger` في `Development`. لإظهار أطباء، أضف بيانات وهمية إلى مجموعة `Doctors` في نفس مشروع المحاكي. المستند يحتاج `Name` و`Specialty` و`AvailableSlots` كخريطة من اليوم لقائمة أوقات. حقول البطاقة الإضافية هي `ClinicLocation` و`ImageUrl` و`Focus` و`Rating` و`RatingCount`.

## الـAPI

- `GET /api/doctors` و`GET /api/doctors/specialty/{specialty}` لعرض الأطباء والمواعيد المتاحة.
- `POST /api/doctors/{id}/rate` يقبل رقم JSON صحيح من 1 إلى 5. كل إرسال متصل يضيف تقييمًا.
- `GET /api/bookings` و`POST /api/bookings` و`DELETE /api/bookings/{id}`. الحجز يقبل `doctorId` و`patientName` و`date` و`time`. القيمتان الأخيرتان تأتيان من جدول الطبيب.
- `GET /api/feedback` و`POST /api/feedback`. الطلب يقبل `patientName` و`suggestion` و`complaint` اختياريًا.

## إعداد المضيف

- شغّل `dotnet publish -c Release` للنشر. اضبط `FirebaseProjectId` على مشروع Firestore المقصود.
- استخدم Application Default Credentials من هوية الخدمة، أو اضبط `GOOGLE_APPLICATION_CREDENTIALS` على مسار ملف الأسرار الذي يوفّره المضيف. للتطوير المحلي فقط يمكن استخدام `Config/serviceAccountKey.json`.
- `FIRESTORE_EMULATOR_HOST` مخصص لـ`Development`. لإضافة أصول واجهة محددة اضبط `Cors__AllowedOrigins__0` وما بعده، بدون مسار أو شرطة مائلة في النهاية. في التطوير `localhost` و`127.0.0.1` على `5500` و`5501` مسموحان تلقائيًا.
- استخدم HTTPS عند نقطة الدخول على المضيف. الواجهات الحالية مفتوحة بدون تسجيل دخول، بما فيها قراءة الحجوزات وFeedback. استخدم قاعدة اختبار وبيانات وهمية إلى أن تُطبّق صلاحيات الحساب وملكية السجلات.
