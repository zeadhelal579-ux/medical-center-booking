// Opens the doctor rating dialog and submits the selected score.
const ratingDialog = document.getElementById("ratingDialog");
const ratingForm = document.getElementById("ratingForm");
const ratingError = document.getElementById("ratingError");
const ratingSubmit = ratingForm.querySelector('button[type="submit"]');
const ratingClose = document.getElementById("closeRating");
let doctorToRate;
let ratingTrigger;

function openRatingDialog(doctor, trigger) {
    doctorToRate = doctor;
    ratingTrigger = trigger;
    ratingForm.reset();
    ratingError.hidden = true;
    document.getElementById("ratingDoctor").textContent = doctor.name;
    const portrait = document.getElementById("ratingPortrait");
    portrait.src = doctor.imageUrl || DEFAULT_AVATAR_SRC;
    attachImageFallback(portrait);

    const radios = Array.from(ratingForm.elements.score);
    radios.forEach((radio) => { radio.checked = Number(radio.value) === doctor.visitorRating; });
    ratingDialog.showModal();
    (radios.find((radio) => radio.checked) || radios[0]).focus();
}

ratingClose.addEventListener("click", () => ratingDialog.close());
ratingDialog.addEventListener("cancel", (event) => {
    if (ratingSubmit.disabled) event.preventDefault();
});

ratingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (ratingSubmit.disabled) return;
    const rating = Number(ratingForm.elements.score.value);
    const doctorId = doctorToRate.id;
    const trigger = ratingTrigger;
    ratingSubmit.disabled = true;
    ratingClose.disabled = true;
    ratingError.hidden = true;
    try {
        const response = await apiRequest(`/doctors/${encodeURIComponent(doctorId)}/rate`, "POST", rating);
        await refreshDoctorLists();
        ratingDialog.close();
        const section = document.querySelector(".active-section");
        const replacement = Array.from(section?.querySelectorAll("[data-rate-doctor]") ?? [])
            .find((button) => button.dataset.rateDoctor === String(doctorId));
        (replacement || trigger).focus();
        showToast(response?.message || "Rating submitted.");
    } catch (error) {
        ratingError.textContent = error.message;
        ratingError.hidden = false;
    } finally {
        ratingSubmit.disabled = false;
        ratingClose.disabled = false;
    }
});
