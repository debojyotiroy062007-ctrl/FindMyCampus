const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'lib', 'data');

// Palettes for various university brands
const PALETTES = [
  { primary: '#7E1B1B', glow: 'rgba(126,27,27,0.30)', border: 'rgba(126,27,27,0.55)', bgTint: 'rgba(126,27,27,0.12)' },
  { primary: '#991B1B', glow: 'rgba(153,27,27,0.30)', border: 'rgba(153,27,27,0.55)', bgTint: 'rgba(153,27,27,0.12)' },
  { primary: '#1E3A8A', glow: 'rgba(30,58,138,0.30)', border: 'rgba(30,58,138,0.55)', bgTint: 'rgba(30,58,138,0.12)' },
  { primary: '#0F766E', glow: 'rgba(15,118,110,0.30)', border: 'rgba(15,118,110,0.55)', bgTint: 'rgba(15,118,110,0.12)' },
  { primary: '#0369A1', glow: 'rgba(3,105,161,0.30)', border: 'rgba(3,105,161,0.55)', bgTint: 'rgba(3,105,161,0.12)' },
  { primary: '#047857', glow: 'rgba(4,120,87,0.30)', border: 'rgba(4,120,87,0.55)', bgTint: 'rgba(4,120,87,0.12)' },
  { primary: '#B45309', glow: 'rgba(180,83,9,0.30)', border: 'rgba(180,83,9,0.55)', bgTint: 'rgba(180,83,9,0.12)' },
  { primary: '#4338CA', glow: 'rgba(67,56,202,0.30)', border: 'rgba(67,56,202,0.55)', bgTint: 'rgba(67,56,202,0.12)' },
  { primary: '#1D4ED8', glow: 'rgba(29,78,216,0.30)', border: 'rgba(29,78,216,0.55)', bgTint: 'rgba(29,78,216,0.12)' },
  { primary: '#059669', glow: 'rgba(5,150,105,0.30)', border: 'rgba(5,150,105,0.55)', bgTint: 'rgba(5,150,105,0.12)' },
  { primary: '#D97706', glow: 'rgba(217,119,6,0.30)', border: 'rgba(217,119,6,0.55)', bgTint: 'rgba(217,119,6,0.12)' },
  { primary: '#BE123C', glow: 'rgba(190,18,60,0.30)', border: 'rgba(190,18,60,0.55)', bgTint: 'rgba(190,18,60,0.12)' },
  { primary: '#4F46E5', glow: 'rgba(79,70,229,0.30)', border: 'rgba(79,70,229,0.55)', bgTint: 'rgba(79,70,229,0.12)' },
  { primary: '#2563EB', glow: 'rgba(37,99,235,0.30)', border: 'rgba(37,99,235,0.55)', bgTint: 'rgba(37,99,235,0.12)' },
  { primary: '#A31F34', glow: 'rgba(163,31,52,0.30)', border: 'rgba(163,31,52,0.55)', bgTint: 'rgba(163,31,52,0.12)' },
  { primary: '#8C1515', glow: 'rgba(140,21,21,0.30)', border: 'rgba(140,21,21,0.55)', bgTint: 'rgba(140,21,21,0.12)' },
  { primary: '#003262', glow: 'rgba(0,50,98,0.30)', border: 'rgba(0,50,98,0.55)', bgTint: 'rgba(0,50,98,0.12)' },
  { primary: '#500778', glow: 'rgba(80,7,120,0.30)', border: 'rgba(80,7,120,0.55)', bgTint: 'rgba(80,7,120,0.12)' },
];

function getPalette(i) {
  return PALETTES[i % PALETTES.length];
}

// ==========================================
// 1. INDIA NIRF 1 - 100 LIST
// ==========================================
const INDIA_NIRF_100 = [
  { name: "Indian Institute of Technology Madras", shortName: "IIT Madras", city: "Chennai", state: "Tamil Nadu", rank: 1, qs: 227, exams: ["JEE Advanced"], cutoff: "AIR ≤ 148", tuition: "2.35 Lakh/yr", med: "26.4 LPA", domain: "iitm.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Delhi", shortName: "IIT Delhi", city: "New Delhi", state: "Delhi", rank: 2, qs: 150, exams: ["JEE Advanced"], cutoff: "AIR ≤ 115", tuition: "2.30 Lakh/yr", med: "25.8 LPA", domain: "iitd.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Bombay", shortName: "IIT Bombay", city: "Mumbai", state: "Maharashtra", rank: 3, qs: 118, exams: ["JEE Advanced"], cutoff: "AIR ≤ 67", tuition: "2.30 Lakh/yr", med: "27.5 LPA", domain: "iitb.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Kanpur", shortName: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", rank: 4, qs: 263, exams: ["JEE Advanced"], cutoff: "AIR ≤ 235", tuition: "2.25 Lakh/yr", med: "24.2 LPA", domain: "iitk.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Kharagpur", shortName: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", rank: 5, qs: 222, exams: ["JEE Advanced"], cutoff: "AIR ≤ 280", tuition: "2.30 Lakh/yr", med: "23.6 LPA", domain: "iitkgp.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Roorkee", shortName: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand", rank: 6, qs: 335, exams: ["JEE Advanced"], cutoff: "AIR ≤ 410", tuition: "2.20 Lakh/yr", med: "22.5 LPA", domain: "iitr.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Hyderabad", shortName: "IIT Hyderabad", city: "Sangareddy", state: "Telangana", rank: 7, qs: 360, exams: ["JEE Advanced"], cutoff: "AIR ≤ 610", tuition: "2.25 Lakh/yr", med: "21.8 LPA", domain: "iith.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Guwahati", shortName: "IIT Guwahati", city: "Guwahati", state: "Assam", rank: 8, qs: 344, exams: ["JEE Advanced"], cutoff: "AIR ≤ 650", tuition: "2.20 Lakh/yr", med: "21.6 LPA", domain: "iitg.ac.in", route: "JoSAA Counseling" },
  { name: "National Institute of Technology Tiruchirappalli", shortName: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", rank: 9, qs: 780, exams: ["JEE Main", "DASA"], cutoff: "Percentile ≥ 99.4", tuition: "1.75 Lakh/yr", med: "18.5 LPA", domain: "nitt.edu", route: "JoSAA / CSAB" },
  { name: "Indian Institute of Technology (BHU) Varanasi", shortName: "IIT BHU", city: "Varanasi", state: "Uttar Pradesh", rank: 10, qs: 531, exams: ["JEE Advanced"], cutoff: "AIR ≤ 1050", tuition: "2.10 Lakh/yr", med: "21.0 LPA", domain: "iitbhu.ac.in", route: "JoSAA Counseling" },
  { name: "Birla Institute of Technology and Science, Pilani", shortName: "BITS Pilani", city: "Pilani", state: "Rajasthan", rank: 11, qs: 800, exams: ["BITSAT"], cutoff: "Score ≥ 325", tuition: "5.45 Lakh/yr", med: "20.5 LPA", domain: "bits-pilani.ac.in", route: "BITS Admission Portal" },
  { name: "National Institute of Technology Karnataka, Surathkal", shortName: "NIT Surathkal", city: "Mangalore", state: "Karnataka", rank: 12, qs: 850, exams: ["JEE Main"], cutoff: "Percentile ≥ 99.2", tuition: "1.80 Lakh/yr", med: "18.2 LPA", domain: "nitk.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Warangal", shortName: "NIT Warangal", city: "Warangal", state: "Telangana", rank: 13, qs: 900, exams: ["JEE Main"], cutoff: "Percentile ≥ 99.0", tuition: "1.75 Lakh/yr", med: "17.8 LPA", domain: "nitw.ac.in", route: "JoSAA / CSAB" },
  { name: "SRM Institute of Science and Technology", shortName: "SRMIST", city: "Chennai", state: "Tamil Nadu", rank: 14, qs: 1000, exams: ["SRMJEEE", "JEE Main"], cutoff: "Rank ≤ 2500", tuition: "4.50 Lakh/yr", med: "10.5 LPA", domain: "srmist.edu.in", route: "SRM Online Counseling" },
  { name: "National Institute of Technology Calicut", shortName: "NIT Calicut", city: "Kozhikode", state: "Kerala", rank: 15, qs: 950, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.8", tuition: "1.75 Lakh/yr", med: "16.5 LPA", domain: "nitc.ac.in", route: "JoSAA / CSAB" },
  { name: "Vellore Institute of Technology", shortName: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", rank: 16, qs: 791, exams: ["VITEEE"], cutoff: "Rank ≤ 3500", tuition: "3.90 Lakh/yr", med: "11.2 LPA", domain: "vit.ac.in", route: "VITEEE Counseling" },
  { name: "Jadavpur University", shortName: "Jadavpur Univ", city: "Kolkata", state: "West Bengal", rank: 17, qs: 750, exams: ["WBJEE"], cutoff: "WBJEE GMR ≤ 110", tuition: "₹10,000/yr", med: "16.8 LPA", domain: "jaduniv.edu.in", route: "WBJEE Central Counseling" },
  { name: "Anna University College of Engineering Guindy", shortName: "Anna Univ CEG", city: "Chennai", state: "Tamil Nadu", rank: 18, qs: 850, exams: ["TNEA", "12th Board"], cutoff: "Cutoff ≥ 199.5/200", tuition: "₹55,000/yr", med: "12.5 LPA", domain: "annauniv.edu", route: "TNEA Single Window" },
  { name: "National Institute of Technology Rourkela", shortName: "NIT Rourkela", city: "Rourkela", state: "Odisha", rank: 19, qs: 900, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.9", tuition: "1.75 Lakh/yr", med: "16.2 LPA", domain: "nitrkl.ac.in", route: "JoSAA / CSAB" },
  { name: "International Institute of Information Technology Hyderabad", shortName: "IIIT Hyderabad", city: "Hyderabad", state: "Telangana", rank: 20, qs: 600, exams: ["JEE Main (UGEE)"], cutoff: "Percentile ≥ 99.8", tuition: "3.60 Lakh/yr", med: "32.0 LPA", domain: "iiit.ac.in", route: "IIIT-H Admissions" },
  { name: "Thapar Institute of Engineering and Technology", shortName: "Thapar Univ", city: "Patiala", state: "Punjab", rank: 21, qs: 950, exams: ["JEE Main", "12th Board"], cutoff: "Percentile ≥ 96.5", tuition: "4.80 Lakh/yr", med: "12.0 LPA", domain: "thapar.edu", route: "Thapar Direct Portal" },
  { name: "Delhi Technological University", shortName: "DTU Delhi", city: "New Delhi", state: "Delhi", rank: 22, qs: 800, exams: ["JEE Main"], cutoff: "AIR ≤ 4500 (Delhi)", tuition: "2.10 Lakh/yr", med: "17.5 LPA", domain: "dtu.ac.in", route: "JAC Delhi Counseling" },
  { name: "IIEST Shibpur", shortName: "IIEST Shibpur", city: "Howrah", state: "West Bengal", rank: 23, qs: 1000, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.8", tuition: "1.65 Lakh/yr", med: "12.2 LPA", domain: "iiests.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Silchar", shortName: "NIT Silchar", city: "Silchar", state: "Assam", rank: 24, qs: 1100, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.5", tuition: "1.70 Lakh/yr", med: "14.5 LPA", domain: "nits.ac.in", route: "JoSAA / CSAB" },
  { name: "MNIT Jaipur", shortName: "MNIT Jaipur", city: "Jaipur", state: "Rajasthan", rank: 25, qs: 1050, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.7", tuition: "1.75 Lakh/yr", med: "16.0 LPA", domain: "mnit.ac.in", route: "JoSAA / CSAB" },
  { name: "MNNIT Allahabad", shortName: "MNNIT Allahabad", city: "Prayagraj", state: "Uttar Pradesh", rank: 26, qs: 1000, exams: ["JEE Main"], cutoff: "Percentile ≥ 99.1", tuition: "1.75 Lakh/yr", med: "17.2 LPA", domain: "mnnit.ac.in", route: "JoSAA / CSAB" },
  { name: "Aligarh Muslim University", shortName: "AMU Aligarh", city: "Aligarh", state: "Uttar Pradesh", rank: 27, qs: 1100, exams: ["AMU Entrance"], cutoff: "Merit Rank ≤ 350", tuition: "₹65,000/yr", med: "9.5 LPA", domain: "amu.ac.in", route: "AMU Admission Portal" },
  { name: "Amrita Vishwa Vidyapeetham", shortName: "Amrita University", city: "Coimbatore", state: "Tamil Nadu", rank: 28, qs: 820, exams: ["AEEE", "JEE Main"], cutoff: "Percentile ≥ 95.0", tuition: "3.50 Lakh/yr", med: "10.8 LPA", domain: "amrita.edu", route: "AEEE Portal" },
  { name: "Siksha 'O' Anusandhan", shortName: "SOA University", city: "Bhubaneswar", state: "Odisha", rank: 29, qs: 1200, exams: ["SAAT", "JEE Main"], cutoff: "Percentile ≥ 90.0", tuition: "2.75 Lakh/yr", med: "8.5 LPA", domain: "soa.ac.in", route: "SAAT Counseling" },
  { name: "Kalinga Institute of Industrial Technology", shortName: "KIIT Bhubaneswar", city: "Bhubaneswar", state: "Odisha", rank: 30, qs: 1000, exams: ["KIITEE"], cutoff: "Score ≥ 90%", tuition: "3.85 Lakh/yr", med: "9.2 LPA", domain: "kiit.ac.in", route: "KIITEE Portal" },
  { name: "Netaji Subhas University of Technology", shortName: "NSUT Delhi", city: "New Delhi", state: "Delhi", rank: 31, qs: 950, exams: ["JEE Main"], cutoff: "AIR ≤ 5200 (Delhi)", tuition: "2.20 Lakh/yr", med: "17.0 LPA", domain: "nsut.ac.in", route: "JAC Delhi Counseling" },
  { name: "Jamia Millia Islamia", shortName: "JMI New Delhi", city: "New Delhi", state: "Delhi", rank: 32, qs: 900, exams: ["JEE Main"], cutoff: "AIR ≤ 25,000", tuition: "₹45,000/yr", med: "11.0 LPA", domain: "jmi.ac.in", route: "JMI Counseling" },
  { name: "Indian Institute of Technology Indore", shortName: "IIT Indore", city: "Indore", state: "Madhya Pradesh", rank: 33, qs: 450, exams: ["JEE Advanced"], cutoff: "AIR ≤ 1380", tuition: "2.30 Lakh/yr", med: "22.0 LPA", domain: "iiti.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Mandi", shortName: "IIT Mandi", city: "Mandi", state: "Himachal Pradesh", rank: 34, qs: 600, exams: ["JEE Advanced"], cutoff: "AIR ≤ 2900", tuition: "2.25 Lakh/yr", med: "19.5 LPA", domain: "iitmandi.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Ropar", shortName: "IIT Ropar", city: "Rupnagar", state: "Punjab", rank: 35, qs: 580, exams: ["JEE Advanced"], cutoff: "AIR ≤ 2100", tuition: "2.25 Lakh/yr", med: "20.2 LPA", domain: "iitrpr.ac.in", route: "JoSAA Counseling" },
  { name: "SVNIT Surat", shortName: "SVNIT Surat", city: "Surat", state: "Gujarat", rank: 36, qs: 1100, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.4", tuition: "1.75 Lakh/yr", med: "14.2 LPA", domain: "svnit.ac.in", route: "JoSAA / CSAB" },
  { name: "VNIT Nagpur", shortName: "VNIT Nagpur", city: "Nagpur", state: "Maharashtra", rank: 37, qs: 1050, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.6", tuition: "1.75 Lakh/yr", med: "15.0 LPA", domain: "vnit.ac.in", route: "JoSAA / CSAB" },
  { name: "Birla Institute of Technology Mesra", shortName: "BIT Mesra", city: "Ranchi", state: "Jharkhand", rank: 38, qs: 1200, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.2", tuition: "3.40 Lakh/yr", med: "13.0 LPA", domain: "bitmesra.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Durgapur", shortName: "NIT Durgapur", city: "Durgapur", state: "West Bengal", rank: 39, qs: 1150, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.1", tuition: "1.70 Lakh/yr", med: "14.0 LPA", domain: "nitdgp.ac.in", route: "JoSAA / CSAB" },
  { name: "Manipal Institute of Technology", shortName: "MIT Manipal", city: "Manipal", state: "Karnataka", rank: 40, qs: 950, exams: ["MET"], cutoff: "Rank ≤ 1800", tuition: "4.60 Lakh/yr", med: "12.5 LPA", domain: "manipal.edu", route: "MET Online Counseling" },
  { name: "Indian Institute of Technology Gandhinagar", shortName: "IIT Gandhinagar", city: "Gandhinagar", state: "Gujarat", rank: 41, qs: 550, exams: ["JEE Advanced"], cutoff: "AIR ≤ 1600", tuition: "2.30 Lakh/yr", med: "20.8 LPA", domain: "iitgn.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Jodhpur", shortName: "IIT Jodhpur", city: "Jodhpur", state: "Rajasthan", rank: 42, qs: 650, exams: ["JEE Advanced"], cutoff: "AIR ≤ 2600", tuition: "2.25 Lakh/yr", med: "18.8 LPA", domain: "iitj.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Patna", shortName: "IIT Patna", city: "Patna", state: "Bihar", rank: 43, qs: 600, exams: ["JEE Advanced"], cutoff: "AIR ≤ 2800", tuition: "2.25 Lakh/yr", med: "19.2 LPA", domain: "iitp.ac.in", route: "JoSAA Counseling" },
  { name: "Indian Institute of Technology Bhubaneswar", shortName: "IIT Bhubaneswar", city: "Bhubaneswar", state: "Odisha", rank: 44, qs: 680, exams: ["JEE Advanced"], cutoff: "AIR ≤ 3100", tuition: "2.25 Lakh/yr", med: "18.5 LPA", domain: "iitbbs.ac.in", route: "JoSAA Counseling" },
  { name: "PSG College of Technology", shortName: "PSG Tech", city: "Coimbatore", state: "Tamil Nadu", rank: 45, qs: 1100, exams: ["TNEA"], cutoff: "Cutoff ≥ 198/200", tuition: "1.10 Lakh/yr", med: "11.5 LPA", domain: "psgtech.edu", route: "TNEA Single Window" },
  { name: "SASTRA Deemed University", shortName: "SASTRA Thanjavur", city: "Thanjavur", state: "Tamil Nadu", rank: 46, qs: 1200, exams: ["JEE Main + 12th"], cutoff: "Percentile ≥ 94.0", tuition: "1.60 Lakh/yr", med: "9.0 LPA", domain: "sastra.edu", route: "SASTRA Portal" },
  { name: "College of Engineering Pune", shortName: "COEP Technological Univ", city: "Pune", state: "Maharashtra", rank: 47, qs: 1000, exams: ["MHT-CET", "JEE Main"], cutoff: "Percentile ≥ 99.6", tuition: "1.25 Lakh/yr", med: "14.8 LPA", domain: "coep.org.in", route: "MHT-CET CAP Rounds" },
  { name: "National Institute of Technology Kurukshetra", shortName: "NIT Kurukshetra", city: "Kurukshetra", state: "Haryana", rank: 48, qs: 1050, exams: ["JEE Main"], cutoff: "Percentile ≥ 98.5", tuition: "1.75 Lakh/yr", med: "15.4 LPA", domain: "nitkkr.ac.in", route: "JoSAA / CSAB" },
  { name: "IIIT Allahabad", shortName: "IIIT Allahabad", city: "Prayagraj", state: "Uttar Pradesh", rank: 49, qs: 750, exams: ["JEE Main"], cutoff: "Percentile ≥ 99.3", tuition: "2.20 Lakh/yr", med: "24.5 LPA", domain: "iiita.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Jalandhar", shortName: "NIT Jalandhar", city: "Jalandhar", state: "Punjab", rank: 50, qs: 1150, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.9", tuition: "1.70 Lakh/yr", med: "13.8 LPA", domain: "nitj.ac.in", route: "JoSAA / CSAB" },
  // 51 - 100 NIRF
  { name: "Graphic Era University", shortName: "Graphic Era", city: "Dehradun", state: "Uttarakhand", rank: 51, qs: 1300, exams: ["12th Board", "JEE Main"], cutoff: "88% in 12th", tuition: "3.20 Lakh/yr", med: "7.8 LPA", domain: "geu.ac.in", route: "GEU Direct" },
  { name: "Indian Institute of Space Science and Technology", shortName: "IIST Trivandrum", city: "Thiruvananthapuram", state: "Kerala", rank: 52, qs: 800, exams: ["JEE Advanced"], cutoff: "AIR ≤ 4200", tuition: "₹75,000/yr", med: "16.5 LPA", domain: "iist.ac.in", route: "IIST Admission Portal" },
  { name: "National Institute of Technology Meghalaya", shortName: "NIT Meghalaya", city: "Shillong", state: "Meghalaya", rank: 53, qs: 1250, exams: ["JEE Main"], cutoff: "Percentile ≥ 96.8", tuition: "1.65 Lakh/yr", med: "12.0 LPA", domain: "nitm.ac.in", route: "JoSAA / CSAB" },
  { name: "Sathyabama Institute of Science and Technology", shortName: "Sathyabama Univ", city: "Chennai", state: "Tamil Nadu", rank: 54, qs: 1200, exams: ["SAEEE"], cutoff: "Rank ≤ 4500", tuition: "2.50 Lakh/yr", med: "6.8 LPA", domain: "sathyabama.ac.in", route: "SAEEE Counseling" },
  { name: "Defence Institute of Advanced Technology", shortName: "DIAT Pune", city: "Pune", state: "Maharashtra", rank: 55, qs: 900, exams: ["GATE"], cutoff: "Score ≥ 650", tuition: "₹85,000/yr", med: "15.0 LPA", domain: "diat.ac.in", route: "CCMT" },
  { name: "National Institute of Technology Raipur", shortName: "NIT Raipur", city: "Raipur", state: "Chhattisgarh", rank: 56, qs: 1200, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.4", tuition: "1.70 Lakh/yr", med: "13.5 LPA", domain: "nitrr.ac.in", route: "JoSAA / CSAB" },
  { name: "Indraprastha Institute of Information Technology Delhi", shortName: "IIIT Delhi", city: "New Delhi", state: "Delhi", rank: 57, qs: 680, exams: ["JEE Main"], cutoff: "AIR ≤ 6800", tuition: "4.40 Lakh/yr", med: "23.7 LPA", domain: "iiitd.ac.in", route: "JAC Delhi Counseling" },
  { name: "Veermata Jijabai Technological Institute", shortName: "VJTI Mumbai", city: "Mumbai", state: "Maharashtra", rank: 58, qs: 950, exams: ["MHT-CET"], cutoff: "Percentile ≥ 99.4", tuition: "₹90,000/yr", med: "15.2 LPA", domain: "vjti.ac.in", route: "MHT-CET CAP" },
  { name: "University College of Engineering, Osmania University", shortName: "UCE Osmania", city: "Hyderabad", state: "Telangana", rank: 59, qs: 1100, exams: ["TS EAMCET"], cutoff: "Rank ≤ 1200", tuition: "₹50,000/yr", med: "10.5 LPA", domain: "uceou.edu", route: "TS EAMCET" },
  { name: "National Institute of Technology Agartala", shortName: "NIT Agartala", city: "Agartala", state: "Tripura", rank: 60, qs: 1250, exams: ["JEE Main"], cutoff: "Percentile ≥ 96.5", tuition: "1.65 Lakh/yr", med: "12.2 LPA", domain: "nita.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Patna", shortName: "NIT Patna", city: "Patna", state: "Bihar", rank: 61, qs: 1200, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.6", tuition: "1.70 Lakh/yr", med: "13.8 LPA", domain: "nitp.ac.in", route: "JoSAA / CSAB" },
  { name: "Pandit Deendayal Energy University", shortName: "PDEU Gandhinagar", city: "Gandhinagar", state: "Gujarat", rank: 62, qs: 1300, exams: ["JEE Main", "GUJCET"], cutoff: "Percentile ≥ 92.0", tuition: "2.60 Lakh/yr", med: "8.8 LPA", domain: "pdeu.ac.in", route: "PDEU Counseling" },
  { name: "Chandigarh University", shortName: "Chandigarh Univ", city: "Mohali", state: "Punjab", rank: 63, qs: 1100, exams: ["CUCET"], cutoff: "CUCET ≥ 85%", tuition: "2.20 Lakh/yr", med: "7.5 LPA", domain: "cuchd.in", route: "CUCET Portal" },
  { name: "Koneru Lakshmaiah Education Foundation", shortName: "KL University", city: "Vaddeswaram", state: "Andhra Pradesh", rank: 64, qs: 1250, exams: ["KLEEE"], cutoff: "Score ≥ 80%", tuition: "2.80 Lakh/yr", med: "8.2 LPA", domain: "kluniversity.in", route: "KL Portal" },
  { name: "National Institute of Technology Goa", shortName: "NIT Goa", city: "Ponda", state: "Goa", rank: 65, qs: 1200, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.5", tuition: "1.70 Lakh/yr", med: "13.0 LPA", domain: "nitgoa.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Puducherry", shortName: "NIT Puducherry", city: "Karaikal", state: "Puducherry", rank: 66, qs: 1300, exams: ["JEE Main"], cutoff: "Percentile ≥ 96.8", tuition: "1.65 Lakh/yr", med: "11.5 LPA", domain: "nitpy.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Hamirpur", shortName: "NIT Hamirpur", city: "Hamirpur", state: "Himachal Pradesh", rank: 67, qs: 1200, exams: ["JEE Main"], cutoff: "Percentile ≥ 97.5", tuition: "1.70 Lakh/yr", med: "13.2 LPA", domain: "nith.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Manipur", shortName: "NIT Manipur", city: "Imphal", state: "Manipur", rank: 68, qs: 1350, exams: ["JEE Main"], cutoff: "Percentile ≥ 95.8", tuition: "1.60 Lakh/yr", med: "10.0 LPA", domain: "nitmanipur.ac.in", route: "JoSAA / CSAB" },
  { name: "Harcourt Butler Technical University", shortName: "HBTU Kanpur", city: "Kanpur", state: "Uttar Pradesh", rank: 69, qs: 1250, exams: ["JEE Main"], cutoff: "AIR ≤ 28,000", tuition: "1.35 Lakh/yr", med: "11.0 LPA", domain: "hbtu.ac.in", route: "HBTU Counseling" },
  { name: "Jawaharlal Nehru Technological University", shortName: "JNTU Hyderabad", city: "Hyderabad", state: "Telangana", rank: 70, qs: 1100, exams: ["TS EAMCET"], cutoff: "Rank ≤ 1500", tuition: "₹60,000/yr", med: "9.8 LPA", domain: "jntuh.ac.in", route: "TS EAMCET" },
  { name: "UIET Panjab University", shortName: "UIET Chandigarh", city: "Chandigarh", state: "Chandigarh", rank: 71, qs: 1200, exams: ["JEE Main"], cutoff: "AIR ≤ 35,000", tuition: "1.10 Lakh/yr", med: "10.2 LPA", domain: "puchd.ac.in", route: "JAC Chandigarh" },
  { name: "Institute of Chemical Technology", shortName: "ICT Mumbai", city: "Mumbai", state: "Maharashtra", rank: 72, qs: 850, exams: ["MHT-CET", "JEE Main"], cutoff: "Percentile ≥ 99.2", tuition: "1.00 Lakh/yr", med: "14.5 LPA", domain: "ictmumbai.edu.in", route: "MHT-CET CAP" },
  { name: "Vel Tech R&D Institute", shortName: "Vel Tech Chennai", city: "Chennai", state: "Tamil Nadu", rank: 73, qs: 1350, exams: ["VTUEEE"], cutoff: "Rank ≤ 5000", tuition: "2.40 Lakh/yr", med: "6.5 LPA", domain: "veltech.edu.in", route: "Vel Tech Portal" },
  { name: "Guru Gobind Singh Indraprastha University", shortName: "GGSIPU Delhi", city: "New Delhi", state: "Delhi", rank: 74, qs: 1150, exams: ["JEE Main"], cutoff: "AIR ≤ 42,000", tuition: "1.40 Lakh/yr", med: "10.0 LPA", domain: "ipu.ac.in", route: "IPU CET Counseling" },
  { name: "National Institute of Technology Uttarakhand", shortName: "NIT Uttarakhand", city: "Srinagar Garhwal", state: "Uttarakhand", rank: 75, qs: 1300, exams: ["JEE Main"], cutoff: "Percentile ≥ 96.5", tuition: "1.65 Lakh/yr", med: "11.2 LPA", domain: "nituk.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Arunachal Pradesh", shortName: "NIT Arunachal", city: "Yupia", state: "Arunachal Pradesh", rank: 76, qs: 1400, exams: ["JEE Main"], cutoff: "Percentile ≥ 95.0", tuition: "1.60 Lakh/yr", med: "9.5 LPA", domain: "nitap.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Mizoram", shortName: "NIT Mizoram", city: "Aizawl", state: "Mizoram", rank: 77, qs: 1400, exams: ["JEE Main"], cutoff: "Percentile ≥ 95.2", tuition: "1.60 Lakh/yr", med: "9.8 LPA", domain: "nitmz.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Nagaland", shortName: "NIT Nagaland", city: "Dimapur", state: "Nagaland", rank: 78, qs: 1400, exams: ["JEE Main"], cutoff: "Percentile ≥ 95.0", tuition: "1.60 Lakh/yr", med: "9.2 LPA", domain: "nitnagaland.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Sikkim", shortName: "NIT Sikkim", city: "Ravangla", state: "Sikkim", rank: 79, qs: 1380, exams: ["JEE Main"], cutoff: "Percentile ≥ 95.4", tuition: "1.60 Lakh/yr", med: "10.2 LPA", domain: "nitsikkim.ac.in", route: "JoSAA / CSAB" },
  { name: "National Institute of Technology Andhra Pradesh", shortName: "NIT Andhra Pradesh", city: "Tadepalligudem", state: "Andhra Pradesh", rank: 80, qs: 1300, exams: ["JEE Main"], cutoff: "Percentile ≥ 96.9", tuition: "1.65 Lakh/yr", med: "11.8 LPA", domain: "nitandhra.ac.in", route: "JoSAA / CSAB" },
  { name: "International Institute of Information Technology Bangalore", shortName: "IIIT Bangalore", city: "Bengaluru", state: "Karnataka", rank: 81, qs: 650, exams: ["JEE Main"], cutoff: "AIR ≤ 9500", tuition: "4.20 Lakh/yr", med: "28.5 LPA", domain: "iiitb.ac.in", route: "IIITB Direct" },
  { name: "ABV-IIITM Gwalior", shortName: "IIITM Gwalior", city: "Gwalior", state: "Madhya Pradesh", rank: 82, qs: 900, exams: ["JEE Main"], cutoff: "AIR ≤ 12,000", tuition: "2.10 Lakh/yr", med: "19.5 LPA", domain: "iiitm.ac.in", route: "JoSAA / CSAB" },
  { name: "PDPM IIITDM Jabalpur", shortName: "IIITDM Jabalpur", city: "Jabalpur", state: "Madhya Pradesh", rank: 83, qs: 1050, exams: ["JEE Main"], cutoff: "AIR ≤ 16,000", tuition: "1.90 Lakh/yr", med: "16.0 LPA", domain: "iiitdmj.ac.in", route: "JoSAA / CSAB" },
  { name: "IIITDM Kancheepuram", shortName: "IIITDM Kancheepuram", city: "Chennai", state: "Tamil Nadu", rank: 84, qs: 1100, exams: ["JEE Main"], cutoff: "AIR ≤ 18,000", tuition: "1.85 Lakh/yr", med: "14.8 LPA", domain: "iiitdm.ac.in", route: "JoSAA / CSAB" },
  { name: "Jaypee Institute of Information Technology", shortName: "JIIT Noida", city: "Noida", state: "Uttar Pradesh", rank: 85, qs: 1250, exams: ["JEE Main", "12th Board"], cutoff: "AIR ≤ 48,000", tuition: "2.95 Lakh/yr", med: "11.0 LPA", domain: "jiit.ac.in", route: "JIIT Counseling" },
  { name: "RV College of Engineering", shortName: "RVCE Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 86, qs: 900, exams: ["KCET", "COMEDK"], cutoff: "COMEDK Rank ≤ 420", tuition: "2.80 Lakh/yr", med: "16.5 LPA", domain: "rvce.edu.in", route: "KEA / COMEDK" },
  { name: "BMS College of Engineering", shortName: "BMSCE Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 87, qs: 1000, exams: ["KCET", "COMEDK"], cutoff: "COMEDK Rank ≤ 850", tuition: "2.60 Lakh/yr", med: "13.2 LPA", domain: "bmsce.ac.in", route: "KEA / COMEDK" },
  { name: "M. S. Ramaiah Institute of Technology", shortName: "MSRIT Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 88, qs: 1050, exams: ["KCET", "COMEDK"], cutoff: "COMEDK Rank ≤ 1100", tuition: "2.60 Lakh/yr", med: "12.8 LPA", domain: "msrit.edu", route: "KEA / COMEDK" },
  { name: "Dayananda Sagar College of Engineering", shortName: "DSCE Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 89, qs: 1200, exams: ["KCET", "COMEDK"], cutoff: "COMEDK Rank ≤ 2400", tuition: "2.40 Lakh/yr", med: "9.5 LPA", domain: "dsce.edu.in", route: "COMEDK" },
  { name: "Siddaganga Institute of Technology", shortName: "SIT Tumkur", city: "Tumkur", state: "Karnataka", rank: 90, qs: 1300, exams: ["KCET", "COMEDK"], cutoff: "COMEDK Rank ≤ 4500", tuition: "1.90 Lakh/yr", med: "8.2 LPA", domain: "sit.ac.in", route: "COMEDK" },
  { name: "PES University", shortName: "PES Univ Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 91, qs: 950, exams: ["PESSAT", "KCET"], cutoff: "PESSAT Rank ≤ 900", tuition: "4.50 Lakh/yr", med: "14.0 LPA", domain: "pes.edu", route: "PESSAT Counseling" },
  { name: "SSN College of Engineering", shortName: "SSN Chennai", city: "Chennai", state: "Tamil Nadu", rank: 92, qs: 1100, exams: ["TNEA"], cutoff: "Cutoff ≥ 197.5/200", tuition: "1.25 Lakh/yr", med: "11.2 LPA", domain: "ssn.edu.in", route: "TNEA Counseling" },
  { name: "Thiagarajar College of Engineering", shortName: "TCE Madurai", city: "Madurai", state: "Tamil Nadu", rank: 93, qs: 1150, exams: ["TNEA"], cutoff: "Cutoff ≥ 196.5/200", tuition: "₹65,000/yr", med: "9.8 LPA", domain: "tce.edu", route: "TNEA Single Window" },
  { name: "Coimbatore Institute of Technology", shortName: "CIT Coimbatore", city: "Coimbatore", state: "Tamil Nadu", rank: 94, qs: 1200, exams: ["TNEA"], cutoff: "Cutoff ≥ 196.0/200", tuition: "₹60,000/yr", med: "9.5 LPA", domain: "cit.edu.in", route: "TNEA Single Window" },
  { name: "Kumaraguru College of Technology", shortName: "KCT Coimbatore", city: "Coimbatore", state: "Tamil Nadu", rank: 95, qs: 1250, exams: ["TNEA"], cutoff: "Cutoff ≥ 194.5/200", tuition: "1.40 Lakh/yr", med: "8.5 LPA", domain: "kct.ac.in", route: "TNEA Single Window" },
  { name: "Heritage Institute of Technology", shortName: "Heritage Kolkata", city: "Kolkata", state: "West Bengal", rank: 96, qs: 1350, exams: ["WBJEE"], cutoff: "WBJEE GMR ≤ 3800", tuition: "1.20 Lakh/yr", med: "7.8 LPA", domain: "heritageit.edu", route: "WBJEE Counseling" },
  { name: "Institute of Engineering and Management", shortName: "IEM Kolkata", city: "Kolkata", state: "West Bengal", rank: 97, qs: 1300, exams: ["WBJEE", "JEE Main"], cutoff: "WBJEE GMR ≤ 2900", tuition: "1.45 Lakh/yr", med: "8.2 LPA", domain: "iem.edu.in", route: "WBJEE Counseling" },
  { name: "Walchand College of Engineering", shortName: "Walchand Sangli", city: "Sangli", state: "Maharashtra", rank: 98, qs: 1250, exams: ["MHT-CET"], cutoff: "Percentile ≥ 98.8", tuition: "₹85,000/yr", med: "10.5 LPA", domain: "walchandsangli.ac.in", route: "MHT-CET CAP" },
  { name: "Government College of Technology", shortName: "GCT Coimbatore", city: "Coimbatore", state: "Tamil Nadu", rank: 99, qs: 1300, exams: ["TNEA"], cutoff: "Cutoff ≥ 195/200", tuition: "₹45,000/yr", med: "8.8 LPA", domain: "gct.ac.in", route: "TNEA Counseling" },
  { name: "Sardar Patel Institute of Technology", shortName: "SPIT Mumbai", city: "Mumbai", state: "Maharashtra", rank: 100, qs: 1100, exams: ["MHT-CET", "JEE Main"], cutoff: "Percentile ≥ 99.3", tuition: "1.75 Lakh/yr", med: "15.0 LPA", domain: "spit.ac.in", route: "MHT-CET CAP" }
];

// Helper to convert to University TS model
function formatUniversity(u, idx) {
  const pal = getPalette(idx);
  const id = u.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: id,
    name: u.name,
    shortName: u.shortName,
    city: u.city,
    state: u.state || "",
    countryCode: u.countryCode || "IN",
    countryName: u.countryName || "India",
    nationalRank: u.rank,
    rankingBody: u.rankingBody || "NIRF 2025",
    globalRankQS: u.qs,
    qsRank: u.qs,
    acceptanceRate: u.acceptanceRate || (u.rank <= 10 ? "~1.8%" : u.rank <= 30 ? "~4.5%" : "~12.0%"),
    tuitionAnnual: {
      localCurrency: u.tuitionCurrency || "₹",
      localAmount: u.tuition,
      inrEquivalent: u.tuition.startsWith("₹") ? u.tuition : `₹${u.tuition}`
    },
    annualTuition: u.tuition,
    medianPackage: {
      localCurrency: u.packageCurrency || "₹",
      localAmount: u.med,
      inrEquivalent: u.med.startsWith("₹") ? u.med : `₹${u.med}`
    },
    medianPlacement: u.med,
    acceptedExams: u.exams,
    cutoffScore: u.cutoff,
    upcomingDeadlines: [
      { title: "National Counseling Round 1", dateOrWindow: "June 2026" },
      { title: "Document Verification & Vault Audit", dateOrWindow: "July 2026" }
    ],
    branchCutoffs: [
      { branchName: "Computer Science & Engineering", primaryExam: u.exams[0], benchmark: u.cutoff, categoryOrQuota: "General / Neutral" },
      { branchName: "Electrical / Electronics", primaryExam: u.exams[0], benchmark: "Top 5% Cohort", categoryOrQuota: "General / Neutral" },
      { branchName: "Data Science & AI", primaryExam: u.exams[0], benchmark: "Top 3% Cohort", categoryOrQuota: "General / Neutral" }
    ],
    admissionRoute: u.route,
    applicationPortal: u.route.split(" ")[0],
    keyStrengths: [
      `NIRF Ranked #${u.rank} Engineering Institution`,
      "High Tech Research Labs & Center of Excellence",
      "Robust Corporate Placement Consortium"
    ],
    pros: [
      "Extensive industry partnerships and stellar alumni pedigree",
      "Autonomous curriculum with direct venture incubation support"
    ],
    cons: [
      "Rigorous grading standards and competitive cutoff floor"
    ],
    requiredDocs: [
      "Class 10 Board Certificate",
      "Class 12 Marksheet & Passing Certificate",
      `${u.exams[0]} Scorecard / Rank Proof`,
      "Aadhaar Card / Government ID"
    ],
    applicationTemplate: `${u.shortName} Admissions Dossier`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${u.domain}&sz=128`,
    themeColor: pal
  };
}

// Write India Universities file
const formattedIndia = INDIA_NIRF_100.map((u, i) => formatUniversity(u, i));
const indiaContent = `import type { University } from "@/types/university";\n\nexport const universitiesIndia: University[] = ${JSON.stringify(formattedIndia, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'universitiesIndia.ts'), indiaContent);
console.log(`Generated universitiesIndia.ts with ${formattedIndia.length} institutions.`);

// ==========================================
// 2. US TOP 100 UNIVERSITIES LIST
// ==========================================
const US_TOP_100_NAMES = [
  ["Massachusetts Institute of Technology", "MIT", "Cambridge", "MA", 1, 1, "mit.edu", "$61,990/yr", "$125,000", "SAT ≥ 1540", "~4.0%"],
  ["Stanford University", "Stanford", "Stanford", "CA", 2, 3, "stanford.edu", "$65,127/yr", "$120,000", "SAT ≥ 1530", "~3.7%"],
  ["Harvard University", "Harvard", "Cambridge", "MA", 3, 4, "harvard.edu", "$59,076/yr", "$118,000", "SAT ≥ 1520", "~3.4%"],
  ["California Institute of Technology", "Caltech", "Pasadena", "CA", 4, 10, "caltech.edu", "$63,402/yr", "$122,000", "SAT ≥ 1550", "~3.1%"],
  ["University of Chicago", "UChicago", "Chicago", "IL", 5, 21, "uchicago.edu", "$65,619/yr", "$108,000", "SAT ≥ 1520", "~4.8%"],
  ["University of Pennsylvania", "Penn", "Philadelphia", "PA", 6, 11, "upenn.edu", "$66,104/yr", "$115,000", "SAT ≥ 1530", "~5.9%"],
  ["Princeton University", "Princeton", "Princeton", "NJ", 7, 22, "princeton.edu", "$62,400/yr", "$116,000", "SAT ≥ 1530", "~4.5%"],
  ["Yale University", "Yale", "New Haven", "CT", 8, 23, "yale.edu", "$64,700/yr", "$112,000", "SAT ≥ 1520", "~4.4%"],
  ["Cornell University", "Cornell", "Ithaca", "NY", 9, 16, "cornell.edu", "$66,838/yr", "$110,000", "SAT ≥ 1510", "~7.3%"],
  ["Columbia University", "Columbia", "New York", "NY", 10, 34, "columbia.edu", "$68,400/yr", "$114,000", "SAT ≥ 1520", "~3.9%"],
  ["Johns Hopkins University", "Johns Hopkins", "Baltimore", "MD", 11, 32, "jhu.edu", "$63,340/yr", "$109,000", "SAT ≥ 1530", "~6.2%"],
  ["University of California, Los Angeles", "UCLA", "Los Angeles", "CA", 12, 42, "ucla.edu", "$44,830/yr", "$105,000", "SAT ≥ 1500", "~8.6%"],
  ["University of California, Berkeley", "UC Berkeley", "Berkeley", "CA", 13, 12, "berkeley.edu", "$44,466/yr", "$118,000", "SAT ≥ 1520", "~11.4%"],
  ["New York University", "NYU", "New York", "NY", 14, 43, "nyu.edu", "$62,796/yr", "$98,000", "SAT ≥ 1500", "~8.0%"],
  ["University of Michigan", "U-Michigan", "Ann Arbor", "MI", 15, 44, "umich.edu", "$57,273/yr", "$104,000", "SAT ≥ 1490", "~17.7%"],
  ["Northwestern University", "Northwestern", "Evanston", "IL", 16, 50, "northwestern.edu", "$64,887/yr", "$108,000", "SAT ≥ 1510", "~7.0%"],
  ["Carnegie Mellon University", "Carnegie Mellon", "Pittsburgh", "PA", 17, 58, "cmu.edu", "$63,829/yr", "$124,000", "SAT ≥ 1540", "~11.0%"],
  ["Duke University", "Duke", "Durham", "NC", 18, 61, "duke.edu", "$66,172/yr", "$112,000", "SAT ≥ 1520", "~6.3%"],
  ["University of Texas at Austin", "UT Austin", "Austin", "TX", 19, 66, "utexas.edu", "$41,070/yr", "$102,000", "SAT ≥ 1480", "~28.7%"],
  ["University of California, San Diego", "UC San Diego", "La Jolla", "CA", 20, 72, "ucsd.edu", "$46,000/yr", "$106,000", "SAT ≥ 1490", "~23.7%"],
  ["University of Washington", "UW Seattle", "Seattle", "WA", 21, 76, "washington.edu", "$41,997/yr", "$105,000", "SAT ≥ 1470", "~47.5%"],
  ["University of Illinois Urbana-Champaign", "UIUC", "Urbana", "IL", 22, 69, "illinois.edu", "$39,138/yr", "$112,000", "SAT ≥ 1510", "~44.8%"],
  ["Georgia Institute of Technology", "Georgia Tech", "Atlanta", "GA", 23, 114, "gatech.edu", "$32,940/yr", "$115,000", "SAT ≥ 1500", "~16.0%"],
  ["Purdue University", "Purdue", "West Lafayette", "IN", 24, 89, "purdue.edu", "$31,104/yr", "$98,000", "SAT ≥ 1460", "~52.7%"],
  ["University of Wisconsin-Madison", "UW-Madison", "Madison", "WI", 25, 116, "wisc.edu", "$40,603/yr", "$96,000", "SAT ≥ 1450", "~49.1%"],
  ["Boston University", "Boston Univ", "Boston", "MA", 26, 108, "bu.edu", "$65,168/yr", "$94,000", "SAT ≥ 1460", "~10.7%"],
  ["University of Southern California", "USC", "Los Angeles", "CA", 27, 125, "usc.edu", "$66,640/yr", "$102,000", "SAT ≥ 1480", "~9.9%"],
  ["Ohio State University", "Ohio State", "Columbus", "OH", 28, 208, "osu.edu", "$38,365/yr", "$88,000", "SAT ≥ 1420", "~52.7%"],
  ["University of North Carolina at Chapel Hill", "UNC Chapel Hill", "Chapel Hill", "NC", 29, 155, "unc.edu", "$39,228/yr", "$92,000", "SAT ≥ 1450", "~16.8%"],
  ["Texas A&M University", "Texas A&M", "College Station", "TX", 30, 154, "tamu.edu", "$40,896/yr", "$95,000", "SAT ≥ 1400", "~62.6%"],
  ["Rice University", "Rice", "Houston", "TX", 31, 141, "rice.edu", "$58,128/yr", "$108,000", "SAT ≥ 1520", "~7.7%"],
  ["University of California, Davis", "UC Davis", "Davis", "CA", 32, 130, "ucdavis.edu", "$44,499/yr", "$96,000", "SAT ≥ 1440", "~37.3%"],
  ["University of Florida", "Florida", "Gainesville", "FL", 33, 215, "ufl.edu", "$28,658/yr", "$90,000", "SAT ≥ 1410", "~23.0%"],
  ["Washington University in St. Louis", "WashU", "St. Louis", "MO", 34, 170, "wustl.edu", "$62,982/yr", "$102,000", "SAT ≥ 1510", "~11.8%"],
  ["Pennsylvania State University", "Penn State", "University Park", "PA", 35, 89, "psu.edu", "$40,668/yr", "$92,000", "SAT ≥ 1410", "~55.2%"],
  ["University of Maryland, College Park", "Maryland", "College Park", "MD", 36, 169, "umd.edu", "$41,000/yr", "$98,000", "SAT ≥ 1460", "~34.3%"],
  ["University of Virginia", "UVA", "Charlottesville", "VA", 37, 260, "virginia.edu", "$56,837/yr", "$95,000", "SAT ≥ 1460", "~16.3%"],
  ["Arizona State University", "ASU", "Tempe", "AZ", 38, 200, "asu.edu", "$34,398/yr", "$86,000", "SAT ≥ 1340", "~89.8%"],
  ["University of Colorado Boulder", "CU Boulder", "Boulder", "CO", 39, 240, "colorado.edu", "$42,000/yr", "$94,000", "SAT ≥ 1380", "~79.6%"],
  ["Emory University", "Emory", "Atlanta", "GA", 40, 199, "emory.edu", "$60,774/yr", "$92,000", "SAT ≥ 1470", "~10.5%"],
  ["University of Minnesota Twin Cities", "Minnesota", "Minneapolis", "MN", 41, 195, "umn.edu", "$36,400/yr", "$90,000", "SAT ≥ 1400", "~73.2%"],
  ["Michigan State University", "Michigan State", "East Lansing", "MI", 42, 160, "msu.edu", "$43,000/yr", "$86,000", "SAT ≥ 1360", "~88.0%"],
  ["University of California, Santa Barbara", "UC Santa Barbara", "Santa Barbara", "CA", 43, 178, "ucsb.edu", "$44,500/yr", "$98,000", "SAT ≥ 1460", "~25.8%"],
  ["University of California, Irvine", "UC Irvine", "Irvine", "CA", 44, 268, "uci.edu", "$45,000/yr", "$98,000", "SAT ≥ 1460", "~20.9%"],
  ["Vanderbilt University", "Vanderbilt", "Nashville", "TN", 45, 261, "vanderbilt.edu", "$63,946/yr", "$104,000", "SAT ≥ 1520", "~5.6%"],
  ["University of Pittsburgh", "Pitt", "Pittsburgh", "PA", 46, 222, "pitt.edu", "$39,890/yr", "$88,000", "SAT ≥ 1400", "~49.1%"],
  ["Dartmouth College", "Dartmouth", "Hanover", "NH", 47, 243, "dartmouth.edu", "$65,511/yr", "$110,000", "SAT ≥ 1510", "~5.3%"],
  ["University of Rochester", "Rochester", "Rochester", "NY", 48, 224, "rochester.edu", "$64,384/yr", "$94,000", "SAT ≥ 1450", "~38.8%"],
  ["Brown University", "Brown", "Providence", "RI", 49, 79, "brown.edu", "$68,230/yr", "$114,000", "SAT ≥ 1520", "~5.0%"],
  ["University of Notre Dame", "Notre Dame", "Notre Dame", "IN", 50, 304, "nd.edu", "$62,693/yr", "$102,000", "SAT ≥ 1490", "~11.9%"],
  ["Virginia Tech", "Virginia Tech", "Blacksburg", "VA", 51, 380, "vt.edu", "$35,900/yr", "$95,000", "SAT ≥ 1390", "~57.0%"],
  ["Case Western Reserve University", "Case Western", "Cleveland", "OH", 52, 255, "case.edu", "$64,100/yr", "$96,000", "SAT ≥ 1480", "~27.4%"],
  ["Indiana University Bloomington", "Indiana Univ", "Bloomington", "IN", 53, 339, "indiana.edu", "$40,480/yr", "$84,000", "SAT ≥ 1350", "~82.3%"],
  ["Georgetown University", "Georgetown", "Washington", "DC", 54, 301, "georgetown.edu", "$65,088/yr", "$105,000", "SAT ≥ 1490", "~12.0%"],
  ["University of Arizona", "Arizona", "Tucson", "AZ", 55, 293, "arizona.edu", "$39,600/yr", "$85,000", "SAT ≥ 1320", "~86.8%"],
  ["Tufts University", "Tufts", "Medford", "MA", 56, 379, "tufts.edu", "$67,844/yr", "$98,000", "SAT ≥ 1490", "~9.7%"],
  ["Rutgers University-New Brunswick", "Rutgers", "New Brunswick", "NJ", 57, 299, "rutgers.edu", "$35,000/yr", "$88,000", "SAT ≥ 1390", "~65.3%"],
  ["Florida State University", "FSU", "Tallahassee", "FL", 58, 461, "fsu.edu", "$21,683/yr", "$82,000", "SAT ≥ 1350", "~25.0%"],
  ["University of Massachusetts Amherst", "UMass Amherst", "Amherst", "MA", 59, 275, "umass.edu", "$39,000/yr", "$92,000", "SAT ≥ 1410", "~63.5%"],
  ["University of Miami", "Miami", "Coral Gables", "FL", 60, 313, "miami.edu", "$59,926/yr", "$88,000", "SAT ≥ 1420", "~18.9%"],
  ["North Carolina State University", "NC State", "Raleigh", "NC", 61, 311, "ncsu.edu", "$31,900/yr", "$94,000", "SAT ≥ 1390", "~47.2%"],
  ["Iowa State University", "Iowa State", "Ames", "IA", 62, 400, "iastate.edu", "$28,500/yr", "$85,000", "SAT ≥ 1300", "~90.2%"],
  ["George Washington University", "GWU", "Washington", "DC", 63, 340, "gwu.edu", "$64,790/yr", "$90,000", "SAT ≥ 1400", "~49.0%"],
  ["Colorado School of Mines", "Mines", "Golden", "CO", 64, 450, "mines.edu", "$42,800/yr", "$108,000", "SAT ≥ 1440", "~58.0%"],
  ["Northeastern University", "Northeastern", "Boston", "MA", 65, 396, "northeastern.edu", "$63,141/yr", "$98,000", "SAT ≥ 1490", "~5.6%"],
  ["Illinois Institute of Technology", "Illinois Tech", "Chicago", "IL", 66, 469, "iit.edu", "$53,000/yr", "$92,000", "SAT ≥ 1360", "~61.4%"],
  ["University of Illinois Chicago", "UIC", "Chicago", "IL", 67, 365, "uic.edu", "$32,000/yr", "$86,000", "SAT ≥ 1300", "~78.7%"],
  ["Stony Brook University", "Stony Brook", "Stony Brook", "NY", 68, 440, "stonybrook.edu", "$30,500/yr", "$90,000", "SAT ≥ 1380", "~49.1%"],
  ["University at Buffalo", "Buffalo SUNY", "Buffalo", "NY", 69, 490, "buffalo.edu", "$31,000/yr", "$86,000", "SAT ≥ 1320", "~68.0%"],
  ["University of Utah", "Utah", "Salt Lake City", "UT", 70, 441, "utah.edu", "$34,000/yr", "$88,000", "SAT ≥ 1340", "~89.0%"],
  ["University of Delaware", "Delaware", "Newark", "DE", 71, 499, "udel.edu", "$39,720/yr", "$86,000", "SAT ≥ 1320", "~73.8%"],
  ["Rensselaer Polytechnic Institute", "RPI", "Troy", "NY", 72, 500, "rpi.edu", "$62,500/yr", "$102,000", "SAT ≥ 1450", "~65.0%"],
  ["Syracuse University", "Syracuse", "Syracuse", "NY", 73, 781, "syracuse.edu", "$63,000/yr", "$85,000", "SAT ≥ 1350", "~51.8%"],
  ["Stevens Institute of Technology", "Stevens Tech", "Hoboken", "NJ", 74, 701, "stevens.edu", "$60,952/yr", "$104,000", "SAT ≥ 1420", "~46.0%"],
  ["Worcester Polytechnic Institute", "WPI", "Worcester", "MA", 75, 750, "wpi.edu", "$58,000/yr", "$100,000", "SAT ≥ 1410", "~57.5%"],
  ["Clemson University", "Clemson", "Clemson", "SC", 76, 800, "clemson.edu", "$39,500/yr", "$86,000", "SAT ≥ 1350", "~43.0%"],
  ["Auburn University", "Auburn", "Auburn", "AL", 77, 850, "auburn.edu", "$33,000/yr", "$84,000", "SAT ≥ 1300", "~44.0%"],
  ["Drexel University", "Drexel", "Philadelphia", "PA", 78, 650, "drexel.edu", "$59,000/yr", "$88,000", "SAT ≥ 1320", "~79.7%"],
  ["Oregon State University", "Oregon State", "Corvallis", "OR", 79, 500, "oregonstate.edu", "$34,500/yr", "$86,000", "SAT ≥ 1280", "~82.5%"],
  ["University of Kansas", "Kansas", "Lawrence", "KS", 80, 420, "ku.edu", "$29,000/yr", "$82,000", "SAT ≥ 1280", "~88.0%"],
  ["University of Tennessee, Knoxville", "Tennessee", "Knoxville", "TN", 81, 510, "utk.edu", "$32,000/yr", "$84,000", "SAT ≥ 1300", "~68.0%"],
  ["University of Kentucky", "Kentucky", "Lexington", "KY", 82, 700, "uky.edu", "$33,000/yr", "$80,000", "SAT ≥ 1260", "~94.0%"],
  ["University of Oklahoma", "Oklahoma", "Norman", "OK", 83, 720, "ou.edu", "$30,500/yr", "$82,000", "SAT ≥ 1280", "~72.9%"],
  ["University of Alabama", "Alabama", "Tuscaloosa", "AL", 84, 800, "ua.edu", "$33,000/yr", "$80,000", "SAT ≥ 1280", "~80.0%"],
  ["University of Nebraska-Lincoln", "Nebraska", "Lincoln", "NE", 85, 600, "unl.edu", "$28,000/yr", "$80,000", "SAT ≥ 1260", "~79.0%"],
  ["University of Iowa", "Iowa", "Iowa City", "IA", 86, 500, "uiowa.edu", "$32,500/yr", "$84,000", "SAT ≥ 1280", "~86.0%"],
  ["University of South Florida", "USF", "Tampa", "FL", 87, 600, "usf.edu", "$17,324/yr", "$82,000", "SAT ≥ 1320", "~43.9%"],
  ["University of Central Florida", "UCF", "Orlando", "FL", 88, 590, "ucf.edu", "$22,500/yr", "$82,000", "SAT ≥ 1310", "~41.0%"],
  ["San Diego State University", "SDSU", "San Diego", "CA", 89, 800, "sdsu.edu", "$20,000/yr", "$84,000", "SAT ≥ 1300", "~39.0%"],
  ["Temple University", "Temple", "Philadelphia", "PA", 90, 800, "temple.edu", "$36,000/yr", "$80,000", "SAT ≥ 1260", "~79.7%"],
  ["University of Connecticut", "UConn", "Storrs", "CT", 91, 500, "uconn.edu", "$40,000/yr", "$88,000", "SAT ≥ 1340", "~54.5%"],
  ["Southern Methodist University", "SMU Dallas", "Dallas", "TX", 92, 850, "smu.edu", "$64,460/yr", "$96,000", "SAT ≥ 1420", "~52.0%"],
  ["Baylor University", "Baylor", "Waco", "TX", 93, 1000, "baylor.edu", "$54,000/yr", "$84,000", "SAT ≥ 1320", "~45.0%"],
  ["Tulane University", "Tulane", "New Orleans", "LA", 94, 600, "tulane.edu", "$65,538/yr", "$90,000", "SAT ≥ 1440", "~11.5%"],
  ["Fordham University", "Fordham", "Bronx", "NY", 95, 1000, "fordham.edu", "$60,000/yr", "$84,000", "SAT ≥ 1380", "~54.0%"],
  ["Pepperdine University", "Pepperdine", "Malibu", "CA", 96, 1100, "pepperdine.edu", "$66,000/yr", "$86,000", "SAT ≥ 1360", "~49.0%"],
  ["Santa Clara University", "Santa Clara", "Santa Clara", "CA", 97, 800, "scu.edu", "$58,000/yr", "$108,000", "SAT ≥ 1410", "~52.0%"],
  ["Villanova University", "Villanova", "Villanova", "PA", 98, 1000, "villanova.edu", "$64,000/yr", "$94,000", "SAT ≥ 1420", "~23.0%"],
  ["University of Texas at Dallas", "UT Dallas", "Richardson", "TX", 99, 520, "utdallas.edu", "$39,000/yr", "$96,000", "SAT ≥ 1390", "~84.0%"],
  ["New Jersey Institute of Technology", "NJIT", "Newark", "NJ", 100, 650, "njit.edu", "$35,000/yr", "$95,000", "SAT ≥ 1350", "~68.0%"]
];

function formatUS(u, idx) {
  const pal = getPalette(idx);
  const id = u[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const inrTuition = (parseFloat(u[7].replace(/[^0-9.]/g, '')) * 83 / 100000).toFixed(1) + " Lakh/yr";
  const inrPlacement = (parseFloat(u[8].replace(/[^0-9.]/g, '')) * 83 / 100000).toFixed(1) + " Lakh/yr";
  return {
    id: id,
    name: u[0],
    shortName: u[1],
    city: u[2],
    state: u[3],
    countryCode: "US",
    countryName: "United States",
    nationalRank: u[4],
    rankingBody: "US News 2025",
    globalRankQS: u[5],
    qsRank: u[5],
    acceptanceRate: u[10],
    tuitionAnnual: {
      localCurrency: "$",
      localAmount: u[7],
      inrEquivalent: `₹${inrTuition}`
    },
    annualTuition: u[7],
    medianPackage: {
      localCurrency: "$",
      localAmount: u[8] + "/yr",
      inrEquivalent: `₹${inrPlacement}`
    },
    medianPlacement: u[8] + "/yr",
    acceptedExams: ["SAT", "ACT", "TOEFL / IELTS"],
    cutoffScore: u[9],
    upcomingDeadlines: [
      { title: "Early Action / Decision", dateOrWindow: "November 1, 2025" },
      { title: "Regular Decision Deadline", dateOrWindow: "January 5, 2026" }
    ],
    branchCutoffs: [
      { branchName: "Computer Science", primaryExam: "SAT", benchmark: u[9], categoryOrQuota: "Undergraduate Admissions" },
      { branchName: "Computer Engineering", primaryExam: "SAT", benchmark: "Top Quartile", categoryOrQuota: "Engineering Division" }
    ],
    admissionRoute: "Common Application / Coalition Portal",
    applicationPortal: "Common App",
    keyStrengths: [
      `US Ranked #${u[4]} Top University`,
      "Silicon Valley & Fortune 500 Industry Pipelines",
      "Tier 1 Global Research Infrastructure"
    ],
    pros: [
      "Outstanding campus research facilities and optional practical training (OPT) STEM extensions",
      "Vibrant multidisciplinary curriculum and flexible major-minor tracks"
    ],
    cons: [
      "High international tuition and competitive admissions review"
    ],
    requiredDocs: [
      "Official High School Transcripts",
      "SAT / ACT Score Report (Official)",
      "English Proficiency (IELTS/TOEFL/Duolingo)",
      "Letters of Recommendation (2)",
      "Statement of Purpose / Common App Essay",
      "Financial Verification / Bank Certificate"
    ],
    applicationTemplate: `${u[1]} Common App Dossier`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${u[6]}&sz=128`,
    themeColor: pal
  };
}

const formattedUS = US_TOP_100_NAMES.map((u, i) => formatUS(u, i));
const usContent = `import type { University } from "@/types/university";\n\nexport const universitiesUS: University[] = ${JSON.stringify(formattedUS, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'universitiesUS.ts'), usContent);
console.log(`Generated universitiesUS.ts with ${formattedUS.length} institutions.`);

// ==========================================
// 3. UK TOP 100 UNIVERSITIES LIST
// ==========================================
const UK_TOP_100_NAMES = [
  ["University of Cambridge", "Cambridge", "Cambridge", "Cambridgeshire", 1, 2, "cam.ac.uk", "£37,293/yr", "£48,000", "A*A*A / IB 42", "~15.7%"],
  ["University of Oxford", "Oxford", "Oxford", "Oxfordshire", 2, 3, "ox.ac.uk", "£38,550/yr", "£49,500", "A*A*A / IB 42", "~14.5%"],
  ["Imperial College London", "Imperial", "London", "Greater London", 3, 6, "imperial.ac.uk", "£39,100/yr", "£50,000", "A*A*A / MAT", "~11.5%"],
  ["University College London", "UCL", "London", "Greater London", 4, 9, "ucl.ac.uk", "£35,000/yr", "£44,000", "A*AA / IB 39", "~12.0%"],
  ["University of Edinburgh", "Edinburgh", "Edinburgh", "Scotland", 5, 22, "ed.ac.uk", "£34,800/yr", "£42,000", "AAA / IB 38", "~29.0%"],
  ["University of Manchester", "Manchester", "Manchester", "Greater Manchester", 6, 32, "manchester.ac.uk", "£31,000/yr", "£41,000", "AAA / IB 37", "~56.0%"],
  ["King's College London", "King's College", "London", "Greater London", 7, 40, "kcl.ac.uk", "£33,500/yr", "£40,000", "AAA / IB 37", "~13.0%"],
  ["London School of Economics and Political Science", "LSE", "London", "Greater London", 8, 45, "lse.ac.uk", "£26,592/yr", "£46,000", "A*AA / TMUA", "~8.9%"],
  ["University of Bristol", "Bristol", "Bristol", "Bristol", 9, 55, "bristol.ac.uk", "£29,300/yr", "£40,000", "AAA / IB 38", "~67.0%"],
  ["University of Warwick", "Warwick", "Coventry", "West Midlands", 10, 67, "warwick.ac.uk", "£29,830/yr", "£42,000", "A*AA / TMUA", "~14.0%"],
  ["University of Southampton", "Southampton", "Southampton", "Hampshire", 11, 81, "soton.ac.uk", "£27,400/yr", "£38,000", "AAA / IB 36", "~75.0%"],
  ["University of Glasgow", "Glasgow", "Glasgow", "Scotland", 12, 76, "gla.ac.uk", "£27,930/yr", "£37,000", "AAA / IB 36", "~51.0%"],
  ["University of Leeds", "Leeds", "Leeds", "West Yorkshire", 13, 75, "leeds.ac.uk", "£28,750/yr", "£37,500", "AAA / IB 36", "~64.0%"],
  ["University of Birmingham", "Birmingham", "Birmingham", "West Midlands", 14, 84, "bham.ac.uk", "£28,560/yr", "£38,000", "AAA / IB 36", "~62.0%"],
  ["Durham University", "Durham", "Durham", "County Durham", 15, 78, "durham.ac.uk", "£29,500/yr", "£39,000", "A*AA / IB 38", "~41.0%"],
  ["University of Sheffield", "Sheffield", "Sheffield", "South Yorkshire", 16, 104, "sheffield.ac.uk", "£27,500/yr", "£37,000", "AAA / IB 36", "~71.0%"],
  ["University of St Andrews", "St Andrews", "St Andrews", "Scotland", 17, 95, "st-andrews.ac.uk", "£30,160/yr", "£40,000", "AAA / IB 38", "~37.0%"],
  ["University of Nottingham", "Nottingham", "Nottingham", "Nottinghamshire", 18, 100, "nottingham.ac.uk", "£28,000/yr", "£36,500", "AAA / IB 36", "~73.0%"],
  ["Queen Mary University of London", "Queen Mary", "London", "Greater London", 19, 145, "qmul.ac.uk", "£28,350/yr", "£38,000", "ABB / IB 34", "~43.6%"],
  ["University of York", "York", "York", "North Yorkshire", 20, 167, "york.ac.uk", "£26,800/yr", "£35,000", "AAB / IB 35", "~78.0%"],
  ["University of Exeter", "Exeter", "Exeter", "Devon", 21, 153, "exeter.ac.uk", "£27,500/yr", "£36,000", "AAA / IB 36", "~67.0%"],
  ["University of Bath", "Bath", "Bath", "Somerset", 22, 148, "bath.ac.uk", "£26,500/yr", "£42,000", "A*AA / IB 38", "~23.0%"],
  ["Lancaster University", "Lancaster", "Lancaster", "Lancashire", 23, 122, "lancaster.ac.uk", "£25,400/yr", "£35,000", "AAB / IB 35", "~72.0%"],
  ["University of Liverpool", "Liverpool", "Liverpool", "Merseyside", 24, 176, "liverpool.ac.uk", "£26,000/yr", "£35,000", "AAB / IB 34", "~70.0%"],
  ["Newcastle University", "Newcastle", "Newcastle", "Tyne and Wear", 25, 110, "ncl.ac.uk", "£27,600/yr", "£36,000", "AAB / IB 34", "~72.0%"],
  ["University of Aberdeen", "Aberdeen", "Aberdeen", "Scotland", 26, 208, "abdn.ac.uk", "£24,800/yr", "£34,000", "ABB / IB 34", "~78.0%"],
  ["Cardiff University", "Cardiff", "Cardiff", "Wales", 27, 154, "cardiff.ac.uk", "£26,500/yr", "£35,000", "AAB / IB 34", "~74.0%"],
  ["Queen's University Belfast", "Queen's Belfast", "Belfast", "Northern Ireland", 28, 202, "qub.ac.uk", "£24,500/yr", "£33,500", "AAB / IB 34", "~76.0%"],
  ["University of Sussex", "Sussex", "Brighton", "East Sussex", 29, 218, "sussex.ac.uk", "£24,000/yr", "£33,000", "ABB / IB 32", "~83.0%"],
  ["University of Reading", "Reading", "Reading", "Berkshire", 30, 169, "reading.ac.uk", "£25,300/yr", "£34,000", "ABB / IB 32", "~75.0%"],
  ["University of Strathclyde", "Strathclyde", "Glasgow", "Scotland", 31, 276, "strath.ac.uk", "£24,000/yr", "£35,000", "AAB / IB 34", "~68.0%"],
  ["University of Surrey", "Surrey", "Guildford", "Surrey", 32, 244, "surrey.ac.uk", "£25,000/yr", "£36,000", "ABB / IB 33", "~69.0%"],
  ["Heriot-Watt University", "Heriot-Watt", "Edinburgh", "Scotland", 33, 235, "hw.ac.uk", "£23,500/yr", "£35,000", "ABB / IB 33", "~74.0%"],
  ["University of East Anglia", "UEA", "Norwich", "Norfolk", 34, 295, "uea.ac.uk", "£23,800/yr", "£32,000", "BBB / IB 31", "~79.0%"],
  ["University of Leicester", "Leicester", "Leicester", "Leicestershire", 35, 272, "le.ac.uk", "£24,500/yr", "£33,000", "ABB / IB 32", "~72.0%"],
  ["University of Dundee", "Dundee", "Dundee", "Scotland", 36, 441, "dundee.ac.uk", "£23,000/yr", "£33,000", "ABB / IB 32", "~75.0%"],
  ["Brunel University London", "Brunel", "Uxbridge", "Greater London", 37, 343, "brunel.ac.uk", "£22,000/yr", "£34,000", "BBB / IB 30", "~71.0%"],
  ["University of Essex", "Essex", "Colchester", "Essex", 38, 459, "essex.ac.uk", "£21,500/yr", "£31,000", "BBB / IB 30", "~74.0%"],
  ["University of Kent", "Kent", "Canterbury", "Kent", 39, 380, "kent.ac.uk", "£21,900/yr", "£31,000", "BBB / IB 30", "~85.0%"],
  ["Swansea University", "Swansea", "Swansea", "Wales", 40, 307, "swansea.ac.uk", "£21,750/yr", "£32,000", "BBB / IB 30", "~75.0%"],
  ["University of Stirling", "Stirling", "Stirling", "Scotland", 41, 431, "stir.ac.uk", "£20,800/yr", "£31,000", "BBB / IB 30", "~77.0%"],
  ["Oxford Brookes University", "Oxford Brookes", "Oxford", "Oxfordshire", 42, 413, "brookes.ac.uk", "£17,900/yr", "£30,000", "BBC / IB 29", "~81.0%"],
  ["Birkbeck, University of London", "Birkbeck", "London", "Greater London", 43, 374, "bbk.ac.uk", "£18,500/yr", "£32,000", "BBC / IB 29", "~74.0%"],
  ["Goldsmiths, University of London", "Goldsmiths", "London", "Greater London", 44, 593, "gold.ac.uk", "£20,000/yr", "£30,000", "BBC / IB 29", "~70.0%"],
  ["Aston University", "Aston", "Birmingham", "West Midlands", 45, 446, "aston.ac.uk", "£21,000/yr", "£33,000", "BBB / IB 31", "~76.0%"],
  ["City, University of London", "City Univ London", "London", "Greater London", 46, 328, "city.ac.uk", "£23,000/yr", "£35,000", "ABB / IB 32", "~65.0%"],
  ["University of Hull", "Hull", "Hull", "East Yorkshire", 47, 523, "hull.ac.uk", "£18,300/yr", "£28,000", "CCC / IB 28", "~80.0%"],
  ["Bangor University", "Bangor", "Bangor", "Wales", 48, 481, "bangor.ac.uk", "£18,000/yr", "£28,000", "CCC / IB 28", "~78.0%"],
  ["University of Plymouth", "Plymouth", "Plymouth", "Devon", 49, 561, "plymouth.ac.uk", "£17,500/yr", "£29,000", "CCC / IB 28", "~85.0%"],
  ["University of Portsmouth", "Portsmouth", "Portsmouth", "Hampshire", 50, 502, "port.ac.uk", "£17,900/yr", "£29,000", "CCC / IB 28", "~80.0%"],
  // 51 - 100 UK
  ["University of Westminster", "Westminster", "London", "Greater London", 51, 701, "westminster.ac.uk", "£17,000/yr", "£28,000", "CCC / IB 28", "~82.0%"],
  ["Northumbria University", "Northumbria", "Newcastle", "Tyne and Wear", 52, 548, "northumbria.ac.uk", "£18,250/yr", "£29,000", "CCC / IB 28", "~85.0%"],
  ["Coventry University", "Coventry", "Coventry", "West Midlands", 53, 571, "coventry.ac.uk", "£19,850/yr", "£30,000", "CCC / IB 28", "~78.0%"],
  ["Kingston University", "Kingston", "Kingston upon Thames", "Greater London", 54, 601, "kingston.ac.uk", "£17,200/yr", "£28,000", "CCC / IB 28", "~75.0%"],
  ["Nottingham Trent University", "Nottingham Trent", "Nottingham", "Nottinghamshire", 55, 595, "ntu.ac.uk", "£17,900/yr", "£28,500", "CCC / IB 28", "~82.0%"],
  ["Manchester Metropolitan University", "Manchester Met", "Manchester", "Greater Manchester", 56, 590, "mmu.ac.uk", "£18,500/yr", "£28,500", "CCC / IB 28", "~81.0%"],
  ["Sheffield Hallam University", "Sheffield Hallam", "Sheffield", "South Yorkshire", 57, 801, "shu.ac.uk", "£16,655/yr", "£27,000", "CCC / IB 27", "~83.0%"],
  ["University of the West of England", "UWE Bristol", "Bristol", "Bristol", 58, 801, "uwe.ac.uk", "£15,750/yr", "£28,000", "CCC / IB 27", "~79.0%"],
  ["De Montfort University", "De Montfort", "Leicester", "Leicestershire", 59, 801, "dmu.ac.uk", "£16,250/yr", "£27,000", "CCC / IB 27", "~76.0%"],
  ["University of Greenwich", "Greenwich", "London", "Greater London", 60, 671, "gre.ac.uk", "£17,000/yr", "£28,000", "CCC / IB 27", "~77.0%"],
  ["Liverpool John Moores University", "LJMU", "Liverpool", "Merseyside", 61, 751, "ljmu.ac.uk", "£16,600/yr", "£27,000", "CCC / IB 27", "~80.0%"],
  ["University of Huddersfield", "Huddersfield", "Huddersfield", "West Yorkshire", 62, 567, "hud.ac.uk", "£16,500/yr", "£26,500", "CCC / IB 27", "~79.0%"],
  ["University of Brighton", "Brighton", "Brighton", "East Sussex", 63, 801, "brighton.ac.uk", "£16,900/yr", "£27,000", "CCC / IB 27", "~75.0%"],
  ["University of Salford", "Salford", "Salford", "Greater Manchester", 64, 850, "salford.ac.uk", "£16,500/yr", "£27,000", "CCC / IB 27", "~84.0%"],
  ["University of Central Lancashire", "UCLan", "Preston", "Lancashire", 65, 900, "uclan.ac.uk", "£15,500/yr", "£26,000", "CCC / IB 26", "~82.0%"],
  ["Teesside University", "Teesside", "Middlesbrough", "North Yorkshire", 66, 1000, "tees.ac.uk", "£15,000/yr", "£26,000", "CCC / IB 26", "~80.0%"],
  ["Ulster University", "Ulster", "Coleraine", "Northern Ireland", 67, 550, "ulster.ac.uk", "£16,000/yr", "£27,000", "CCC / IB 27", "~81.0%"],
  ["Edinburgh Napier University", "Edinburgh Napier", "Edinburgh", "Scotland", 68, 801, "napier.ac.uk", "£16,500/yr", "£27,000", "CCC / IB 27", "~78.0%"],
  ["Robert Gordon University", "Robert Gordon", "Aberdeen", "Scotland", 69, 850, "rgu.ac.uk", "£16,000/yr", "£28,000", "CCC / IB 27", "~80.0%"],
  ["Bournemouth University", "Bournemouth", "Poole", "Dorset", 70, 750, "bournemouth.ac.uk", "£17,000/yr", "£27,500", "CCC / IB 27", "~78.0%"],
  ["University of Lincoln", "Lincoln", "Lincoln", "Lincolnshire", 71, 850, "lincoln.ac.uk", "£16,200/yr", "£27,000", "CCC / IB 27", "~83.0%"],
  ["University of Roehampton", "Roehampton", "London", "Greater London", 72, 1000, "roehampton.ac.uk", "£15,750/yr", "£26,000", "CCC / IB 26", "~76.0%"],
  ["Middlesex University", "Middlesex", "London", "Greater London", 73, 750, "mdx.ac.uk", "£16,600/yr", "£27,000", "CCC / IB 26", "~74.0%"],
  ["University of West London", "West London", "London", "Greater London", 74, 950, "uwl.ac.uk", "£15,250/yr", "£26,500", "CCC / IB 26", "~73.0%"],
  ["London Metropolitan University", "London Met", "London", "Greater London", 75, 1000, "londonmet.ac.uk", "£16,000/yr", "£26,000", "CCC / IB 26", "~75.0%"],
  ["University of East London", "East London", "London", "Greater London", 76, 1000, "uel.ac.uk", "£14,800/yr", "£25,500", "CCC / IB 25", "~74.0%"],
  ["London South Bank University", "South Bank", "London", "Greater London", 77, 850, "lsbu.ac.uk", "£15,900/yr", "£27,000", "CCC / IB 26", "~75.0%"],
  ["University of Bedfordshire", "Bedfordshire", "Luton", "Bedfordshire", 78, 1100, "beds.ac.uk", "£14,500/yr", "£25,000", "CCC / IB 25", "~82.0%"],
  ["University of Wolverhampton", "Wolverhampton", "Wolverhampton", "West Midlands", 79, 1000, "wlv.ac.uk", "£14,950/yr", "£25,000", "CCC / IB 25", "~81.0%"],
  ["Staffordshire University", "Staffordshire", "Stoke-on-Trent", "Staffordshire", 80, 1000, "staffs.ac.uk", "£15,000/yr", "£25,500", "CCC / IB 25", "~80.0%"],
  ["University of Derby", "Derby", "Derby", "Derbyshire", 81, 1000, "derby.ac.uk", "£14,900/yr", "£25,000", "CCC / IB 25", "~83.0%"],
  ["University of Sunderland", "Sunderland", "Sunderland", "Tyne and Wear", 82, 1000, "sunderland.ac.uk", "£14,000/yr", "£24,500", "CCC / IB 25", "~82.0%"],
  ["Edge Hill University", "Edge Hill", "Ormskirk", "Lancashire", 83, 1000, "edgehill.ac.uk", "£15,000/yr", "£25,000", "CCC / IB 25", "~85.0%"],
  ["University of Winchester", "Winchester", "Winchester", "Hampshire", 84, 1100, "winchester.ac.uk", "£15,400/yr", "£25,000", "CCC / IB 25", "~80.0%"],
  ["University of Chichester", "Chichester", "Chichester", "West Sussex", 85, 1100, "chi.ac.uk", "£14,800/yr", "£24,500", "CCC / IB 25", "~79.0%"],
  ["University of Chester", "Chester", "Chester", "Cheshire", 86, 1200, "chester.ac.uk", "£14,450/yr", "£25,000", "CCC / IB 25", "~82.0%"],
  ["University of Worcester", "Worcester", "Worcester", "Worcestershire", 87, 1200, "worc.ac.uk", "£14,500/yr", "£24,500", "CCC / IB 25", "~81.0%"],
  ["University of Gloucestershire", "Gloucestershire", "Cheltenham", "Gloucestershire", 88, 1200, "glos.ac.uk", "£15,000/yr", "£24,500", "CCC / IB 25", "~82.0%"],
  ["Bath Spa University", "Bath Spa", "Bath", "Somerset", 89, 1200, "bathspa.ac.uk", "£15,400/yr", "£24,500", "CCC / IB 25", "~77.0%"],
  ["York St John University", "York St John", "York", "North Yorkshire", 90, 1200, "yorksj.ac.uk", "£14,000/yr", "£24,000", "CCC / IB 24", "~82.0%"],
  ["Canterbury Christ Church University", "Canterbury CC", "Canterbury", "Kent", 91, 1200, "canterbury.ac.uk", "£14,500/yr", "£24,500", "CCC / IB 24", "~81.0%"],
  ["Leeds Beckett University", "Leeds Beckett", "Leeds", "West Yorkshire", 92, 1000, "leedsbeckett.ac.uk", "£15,000/yr", "£25,500", "CCC / IB 25", "~81.0%"],
  ["Birmingham City University", "Birmingham City", "Birmingham", "West Midlands", 93, 1000, "bcu.ac.uk", "£16,300/yr", "£26,000", "CCC / IB 25", "~79.0%"],
  ["Cardiff Metropolitan University", "Cardiff Met", "Cardiff", "Wales", 94, 1200, "cardiffmet.ac.uk", "£15,000/yr", "£25,000", "CCC / IB 25", "~75.0%"],
  ["Glasgow Caledonian University", "Glasgow Caledonian", "Glasgow", "Scotland", 95, 1000, "gcu.ac.uk", "£15,500/yr", "£26,000", "CCC / IB 25", "~78.0%"],
  ["Abertay University", "Abertay", "Dundee", "Scotland", 96, 1200, "abertay.ac.uk", "£16,000/yr", "£26,500", "CCC / IB 25", "~76.0%"],
  ["Queen Margaret University", "Queen Margaret", "Musselburgh", "Scotland", 97, 1300, "qmu.ac.uk", "£14,500/yr", "£24,500", "CCC / IB 24", "~77.0%"],
  ["Falmouth University", "Falmouth", "Falmouth", "Cornwall", 98, 1200, "falmouth.ac.uk", "£16,950/yr", "£25,000", "CCC / IB 25", "~72.0%"],
  ["University of Buckingham", "Buckingham", "Buckingham", "Buckinghamshire", 99, 1000, "buckingham.ac.uk", "£19,000/yr", "£30,000", "BBC / IB 30", "~68.0%"],
  ["Harper Adams University", "Harper Adams", "Newport", "Shropshire", 100, 1100, "harper-adams.ac.uk", "£16,000/yr", "£28,000", "CCC / IB 26", "~85.0%"]
];

function formatUK(u, idx) {
  const pal = getPalette(idx);
  const id = u[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const inrTuition = (parseFloat(u[7].replace(/[^0-9.]/g, '')) * 105 / 100000).toFixed(1) + " Lakh/yr";
  const inrPlacement = (parseFloat(u[8].replace(/[^0-9.]/g, '')) * 105 / 100000).toFixed(1) + " Lakh/yr";
  return {
    id: id,
    name: u[0],
    shortName: u[1],
    city: u[2],
    state: u[3],
    countryCode: "GB",
    countryName: "United Kingdom",
    nationalRank: u[4],
    rankingBody: "Complete Univ Guide 2025",
    globalRankQS: u[5],
    qsRank: u[5],
    acceptanceRate: u[10],
    tuitionAnnual: {
      localCurrency: "£",
      localAmount: u[7],
      inrEquivalent: `₹${inrTuition}`
    },
    annualTuition: u[7],
    medianPackage: {
      localCurrency: "£",
      localAmount: u[8] + "/yr",
      inrEquivalent: `₹${inrPlacement}`
    },
    medianPlacement: u[8] + "/yr",
    acceptedExams: ["A-Levels", "IB", "IELTS / PTE"],
    cutoffScore: u[9],
    upcomingDeadlines: [
      { title: "UCAS Oxbridge Deadline", dateOrWindow: "October 15, 2025" },
      { title: "UCAS Standard Equal Consideration", dateOrWindow: "January 29, 2026" }
    ],
    branchCutoffs: [
      { branchName: "Computer Science", primaryExam: "A-Levels", benchmark: u[9], categoryOrQuota: "International Route" },
      { branchName: "Software Engineering", primaryExam: "A-Levels", benchmark: "Minimum ABB", categoryOrQuota: "Faculty of Engineering" }
    ],
    admissionRoute: "UCAS Centralized Application",
    applicationPortal: "UCAS",
    keyStrengths: [
      `UK Ranked #${u[4]} University`,
      "Russell Group / British Research Hub",
      "2-Year UK Post-Study Graduate Visa"
    ],
    pros: [
      "Rigorous 3-year bachelor degree structure and 2-year post-study work visa eligibility",
      "Historical international campus culture and global recognition"
    ],
    cons: [
      "High cost of living across southern England and strict CAS visa financial rules"
    ],
    requiredDocs: [
      "UCAS Application Form",
      "High School Diploma & Predicted Grades",
      "IELTS Academic (6.5 - 7.5)",
      "Academic Reference / Teacher Letter",
      "UCAS Personal Statement"
    ],
    applicationTemplate: `${u[1]} UCAS Dossier`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${u[6]}&sz=128`,
    themeColor: pal
  };
}

const formattedUK = UK_TOP_100_NAMES.map((u, i) => formatUK(u, i));
const ukContent = `import type { University } from "@/types/university";\n\nexport const universitiesUK: University[] = ${JSON.stringify(formattedUK, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'universitiesUK.ts'), ukContent);
console.log(`Generated universitiesUK.ts with ${formattedUK.length} institutions.`);

// ==========================================
// 4. OTHER GLOBAL (DE, CA, SG, AU)
// ==========================================
const OTHER_GLOBAL_NAMES = [
  // Germany
  ["Technical University of Munich", "TUM", "Munich", "Bavaria", "DE", "Germany", 1, 28, "tum.de", "€600/sem", "€68,000", "TestAS ≥ 115", "~8.0%"],
  ["RWTH Aachen University", "RWTH Aachen", "Aachen", "North Rhine-Westphalia", "DE", "Germany", 2, 99, "rwth-aachen.de", "€650/sem", "€65,000", "TestAS ≥ 110", "~12.0%"],
  ["Karlsruhe Institute of Technology", "KIT", "Karlsruhe", "Baden-Württemberg", "DE", "Germany", 3, 102, "kit.edu", "€3,000/yr", "€64,000", "TestAS ≥ 110", "~15.0%"],
  ["Technical University of Berlin", "TU Berlin", "Berlin", "Berlin", "DE", "Germany", 4, 147, "tu.berlin", "€700/sem", "€62,000", "TestAS ≥ 108", "~18.0%"],
  ["Ludwig Maximilian University of Munich", "LMU Munich", "Munich", "Bavaria", "DE", "Germany", 5, 59, "lmu.de", "€300/sem", "€63,000", "TestAS ≥ 112", "~14.0%"],
  ["Heidelberg University", "Heidelberg", "Heidelberg", "Baden-Württemberg", "DE", "Germany", 6, 84, "uni-heidelberg.de", "€3,000/yr", "€62,000", "TestAS ≥ 110", "~16.0%"],
  // Canada
  ["University of Toronto", "U of Toronto", "Toronto", "Ontario", "CA", "Canada", 1, 21, "utoronto.ca", "CAD $60,510/yr", "CAD $92,000", "93% 12th Board", "~43.0%"],
  ["University of British Columbia", "UBC", "Vancouver", "British Columbia", "CA", "Canada", 2, 34, "ubc.ca", "CAD $45,000/yr", "CAD $88,000", "91% 12th Board", "~52.0%"],
  ["University of Waterloo", "U of Waterloo", "Waterloo", "Ontario", "CA", "Canada", 3, 112, "uwaterloo.ca", "CAD $66,000/yr", "CAD $110,000", "96% 12th Board", "~15.0%"],
  ["McGill University", "McGill", "Montreal", "Quebec", "CA", "Canada", 4, 30, "mcgill.ca", "CAD $58,000/yr", "CAD $89,000", "92% 12th Board", "~38.0%"],
  ["McMaster University", "McMaster", "Hamilton", "Ontario", "CA", "Canada", 5, 189, "mcmaster.ca", "CAD $48,000/yr", "CAD $85,000", "90% 12th Board", "~58.0%"],
  // Singapore
  ["National University of Singapore", "NUS", "Singapore", "Queenstown", "SG", "Singapore", 1, 8, "nus.edu.sg", "SGD $39,000/yr", "SGD $78,000", "98% Board / 1520 SAT", "~5.0%"],
  ["Nanyang Technological University", "NTU", "Singapore", "Jurong West", "SG", "Singapore", 2, 15, "ntu.edu.sg", "SGD $38,000/yr", "SGD $75,000", "97% Board / 1500 SAT", "~7.0%"],
  // Australia
  ["UNSW Sydney", "UNSW Sydney", "Sydney", "NSW", "AU", "Australia", 1, 19, "unsw.edu.au", "AUD $54,000/yr", "AUD $95,000", "ATAR 92.00", "~30.0%"],
  ["University of Melbourne", "U of Melbourne", "Melbourne", "VIC", "AU", "Australia", 2, 13, "unimelb.edu.au", "AUD $53,000/yr", "AUD $92,000", "ATAR 90.00", "~35.0%"],
  ["University of Sydney", "USYD", "Sydney", "NSW", "AU", "Australia", 3, 18, "sydney.edu.au", "AUD $54,000/yr", "AUD $94,000", "ATAR 91.00", "~30.0%"],
  ["Australian National University", "ANU", "Canberra", "ACT", "AU", "Australia", 4, 30, "anu.edu.au", "AUD $52,000/yr", "AUD $90,000", "ATAR 88.00", "~35.0%"],
  ["Monash University", "Monash", "Melbourne", "VIC", "AU", "Australia", 5, 37, "monash.edu", "AUD $51,900/yr", "AUD $88,000", "ATAR 85.00", "~40.0%"]
];

function formatOther(u, idx) {
  const pal = getPalette(idx);
  const id = u[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: id,
    name: u[0],
    shortName: u[1],
    city: u[2],
    state: u[3],
    countryCode: u[4],
    countryName: u[5],
    nationalRank: u[6],
    rankingBody: `${u[5]} Official QS 2026`,
    globalRankQS: u[7],
    qsRank: u[7],
    acceptanceRate: u[12],
    tuitionAnnual: {
      localCurrency: u[9].split(" ")[0],
      localAmount: u[9],
      inrEquivalent: u[9].includes("€") ? "₹35,000 - ₹2.5 Lakh/yr" : "₹25.0 - ₹35.0 Lakh/yr"
    },
    annualTuition: u[9],
    medianPackage: {
      localCurrency: u[10].split(" ")[0],
      localAmount: u[10] + "/yr",
      inrEquivalent: "₹45.0 - ₹65.0 Lakh/yr"
    },
    medianPlacement: u[10] + "/yr",
    acceptedExams: ["High School Records", "IELTS / TestAS", "SAT"],
    cutoffScore: u[11],
    upcomingDeadlines: [
      { title: "Intake Application Round", dateOrWindow: "January 15, 2026" },
      { title: "Visa Clearance & Document Audit", dateOrWindow: "May 2026" }
    ],
    branchCutoffs: [
      { branchName: "Computer Science", primaryExam: "High School / Entrance", benchmark: u[11], categoryOrQuota: "International Stream" }
    ],
    admissionRoute: "Direct University Portal",
    applicationPortal: "Direct Portal",
    keyStrengths: [
      `Top Tier Institution in ${u[5]}`,
      "World-Class Research Facilities",
      "Direct Post-Study Work Visa Route"
    ],
    pros: [
      "Low tuition (Germany) or top North American co-op programs (Waterloo/Toronto) or top Asian tech hubs (NUS/NTU)"
    ],
    cons: [
      "Strict language certification or competitive international seat quotas"
    ],
    requiredDocs: [
      "Official Transcripts & Degree Certificates",
      "English / German Language Proof",
      "Financial Capacity Certificate",
      "Valid Passport"
    ],
    applicationTemplate: `${u[1]} Application Dossier`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${u[8]}&sz=128`,
    themeColor: pal
  };
}

const formattedOther = OTHER_GLOBAL_NAMES.map((u, i) => formatOther(u, i));
const otherContent = `import type { University } from "@/types/university";\n\nexport const universitiesOther: University[] = ${JSON.stringify(formattedOther, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'universitiesOther.ts'), otherContent);
console.log(`Generated universitiesOther.ts with ${formattedOther.length} institutions.`);
