// Defines the fictional doctor directory and appointment schedules.
const DEMO_CLINIC_LOCATIONS = {
    Dentist: "Dental Clinic · Floor 1",
    Orthopedics: "Orthopedics Clinic · Floor 2",
    Ophthalmology: "Eye Clinic · Floor 1",
    Neurology: "Neurology Clinic · Floor 3",
    Cardiology: "Heart Clinic · Floor 2",
};

const DEMO_SCHEDULES = [
    { Today: ["10:00 AM", "11:30 AM"], Tomorrow: ["1:00 PM", "3:00 PM"] },
    { Today: ["12:00 PM", "2:30 PM"], Tomorrow: ["10:30 AM", "12:00 PM"] },
    { Today: ["11:00 AM", "1:30 PM"], Tomorrow: ["9:00 AM", "11:00 AM"] },
    { Today: ["2:00 PM", "4:00 PM"], Tomorrow: ["10:00 AM", "2:00 PM"] },
    { Today: ["9:30 AM", "11:00 AM"], Tomorrow: ["11:30 AM", "2:30 PM"] },
];

const DEMO_DOCTORS = [
    ["maya-hassan", "Maya Hassan", "Dentist", "Restorative dentistry", 340, 4.9, 126],
    ["omar-nabil", "Omar Nabil", "Orthopedics", "Sports injuries", 275, 4.8, 94],
    ["lina-farid", "Lina Farid", "Ophthalmology", "Comprehensive eye care", 410, 4.7, 148],
    ["karim-adel", "Karim Adel", "Neurology", "Headache and migraine care", 190, 4.6, 68],
    ["salma-amin", "Salma Amin", "Cardiology", "Preventive cardiology", 320, 4.9, 112],
    ["youssef-samir", "Youssef Samir", "Dentist", "Orthodontics", 224, 4.7, 83],
    ["nadia-mansour", "Nadia Mansour", "Orthopedics", "Hand and wrist care", 288, 4.9, 97],
    ["adam-khaled", "Adam Khaled", "Ophthalmology", "Cataract care", 367, 4.8, 109],
    ["nour-fathy", "Nour Fathy", "Neurology", "Movement disorders", 218, 4.8, 79],
    ["tarek-ashraf", "Tarek Ashraf", "Cardiology", "Heart rhythm care", 305, 4.7, 105],
    ["farah-maher", "Farah Maher", "Dentist", "Family dentistry", 167, 4.8, 61],
    ["hassan-emad", "Hassan Emad", "Orthopedics", "Knee and hip care", 402, 4.7, 136],
    ["reem-sherif", "Reem Sherif", "Ophthalmology", "Pediatric eye care", 293, 4.9, 121],
    ["ali-nasser", "Ali Nasser", "Neurology", "Sleep and nerve disorders", 259, 4.7, 86],
    ["dina-yassin", "Dina Yassin", "Cardiology", "Cardiac imaging", 246, 4.8, 89],
    ["mohamed-salah", "Mohamed Salah", "Dentist", "Periodontics", 301, 4.7, 103],
].map(([id, name, specialty, focus, patientsCount, rating, ratingCount], index) => ({
    id, name: `Dr. ${name}`, specialty, focus, patientsCount, rating, ratingCount,
    imageUrl: `assets/doctors/${index + 1}.jpg`,
    clinicLocation: DEMO_CLINIC_LOCATIONS[specialty],
    availableSlots: DEMO_SCHEDULES[index % DEMO_SCHEDULES.length],
}));
