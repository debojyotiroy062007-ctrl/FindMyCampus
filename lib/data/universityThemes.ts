import type { UniversityThemeColor } from "@/types/university";

export interface UniversityBrandProfile {
  themeColor: UniversityThemeColor;
  logoUrl: string;
  domainFallback?: string;
  crestCode: string;
}

export const UNIVERSITY_BRANDS: Record<string, UniversityBrandProfile> = {
  // ══════════════════════════════════════════════════════════════════
  // 🇮🇳 INDIA (NIRF Top Engineering)
  // ══════════════════════════════════════════════════════════════════
  "iit-madras": {
    themeColor: {
      primary: "#7E1B1B",
      glow: "rgba(126,27,27,0.30)",
      border: "rgba(126,27,27,0.55)",
      bgTint: "rgba(126,27,27,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/240px-IIT_Madras_Logo.svg.png",
    domainFallback: "www.iitm.ac.in",
    crestCode: "IM",
  },
  "iit-delhi": {
    themeColor: {
      primary: "#991B1B",
      glow: "rgba(153,27,27,0.30)",
      border: "rgba(153,27,27,0.55)",
      bgTint: "rgba(153,27,27,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg/240px-Indian_Institute_of_Technology_Delhi_Logo.svg.png",
    domainFallback: "www.iitd.ac.in",
    crestCode: "ID",
  },
  "iit-bombay": {
    themeColor: {
      primary: "#1E3A8A",
      glow: "rgba(30,58,138,0.30)",
      border: "rgba(30,58,138,0.55)",
      bgTint: "rgba(30,58,138,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg/240px-Indian_Institute_of_Technology_Bombay_Logo.svg.png",
    domainFallback: "iitb.ac.in",
    crestCode: "IB",
  },
  "iit-kanpur": {
    themeColor: {
      primary: "#0F766E",
      glow: "rgba(15,118,110,0.30)",
      border: "rgba(15,118,110,0.55)",
      bgTint: "rgba(15,118,110,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/IIT_Kanpur_Logo.svg/240px-IIT_Kanpur_Logo.svg.png",
    domainFallback: "iitk.ac.in",
    crestCode: "IK",
  },
  "iit-kharagpur": {
    themeColor: {
      primary: "#0369A1",
      glow: "rgba(3,105,161,0.30)",
      border: "rgba(3,105,161,0.55)",
      bgTint: "rgba(3,105,161,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/240px-IIT_Kharagpur_Logo.svg.png",
    domainFallback: "iitkgp.ac.in",
    crestCode: "KG",
  },
  "iit-roorkee": {
    themeColor: {
      primary: "#047857",
      glow: "rgba(4,120,87,0.30)",
      border: "rgba(4,120,87,0.55)",
      bgTint: "rgba(4,120,87,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Indian_Institute_of_Technology_Roorkee_logo.png/240px-Indian_Institute_of_Technology_Roorkee_logo.png",
    domainFallback: "iitr.ac.in",
    crestCode: "IR",
  },
  "iit-hyderabad": {
    themeColor: {
      primary: "#B45309",
      glow: "rgba(180,83,9,0.30)",
      border: "rgba(180,83,9,0.55)",
      bgTint: "rgba(180,83,9,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/19/IIT_Hyderabad_Insignia.svg/240px-IIT_Hyderabad_Insignia.svg.png",
    domainFallback: "iith.ac.in",
    crestCode: "IH",
  },
  "iit-guwahati": {
    themeColor: {
      primary: "#4338CA",
      glow: "rgba(67,56,202,0.30)",
      border: "rgba(67,56,202,0.55)",
      bgTint: "rgba(67,56,202,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/IIT_Guwahati_Logo.svg/240px-IIT_Guwahati_Logo.svg.png",
    domainFallback: "iitg.ac.in",
    crestCode: "IG",
  },
  "nit-trichy": {
    themeColor: {
      primary: "#0E7490",
      glow: "rgba(14,116,144,0.30)",
      border: "rgba(14,116,144,0.55)",
      bgTint: "rgba(14,116,144,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/NIT_Trichy_Logo.png/240px-NIT_Trichy_Logo.png",
    domainFallback: "nitt.edu",
    crestCode: "NT",
  },
  "iit-bhu": {
    themeColor: {
      primary: "#B91C1C",
      glow: "rgba(185,28,28,0.30)",
      border: "rgba(185,28,28,0.55)",
      bgTint: "rgba(185,28,28,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/IIT_%28BHU%29_Varanasi_Logo.svg/240px-IIT_%28BHU%29_Varanasi_Logo.svg.png",
    domainFallback: "iitbhu.ac.in",
    crestCode: "BH",
  },
  "bits-pilani": {
    themeColor: {
      primary: "#1D4ED8",
      glow: "rgba(29,78,216,0.30)",
      border: "rgba(29,78,216,0.55)",
      bgTint: "rgba(29,78,216,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/240px-BITS_Pilani-Logo.svg.png",
    domainFallback: "bits-pilani.ac.in",
    crestCode: "BP",
  },
  "nit-surathkal": {
    themeColor: {
      primary: "#059669",
      glow: "rgba(5,150,105,0.30)",
      border: "rgba(5,150,105,0.55)",
      bgTint: "rgba(5,150,105,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/NITK_Surathkal_Logo.svg/240px-NITK_Surathkal_Logo.svg.png",
    domainFallback: "nitk.ac.in",
    crestCode: "SK",
  },
  "nit-warangal": {
    themeColor: {
      primary: "#D97706",
      glow: "rgba(217,119,6,0.30)",
      border: "rgba(217,119,6,0.55)",
      bgTint: "rgba(217,119,6,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/NIT_Warangal_Logo.svg/240px-NIT_Warangal_Logo.svg.png",
    domainFallback: "nitw.ac.in",
    crestCode: "NW",
  },
  "srmist": {
    themeColor: {
      primary: "#1E40AF",
      glow: "rgba(30,64,175,0.30)",
      border: "rgba(30,64,175,0.55)",
      bgTint: "rgba(30,64,175,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fe/SRM_Institute_of_Science_and_Technology_logo.png/240px-SRM_Institute_of_Science_and_Technology_logo.png",
    domainFallback: "srmist.edu.in",
    crestCode: "SR",
  },
  "nit-calicut": {
    themeColor: {
      primary: "#0891B2",
      glow: "rgba(8,145,178,0.30)",
      border: "rgba(8,145,178,0.55)",
      bgTint: "rgba(8,145,178,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/NIT_Calicut_Logo.png/240px-NIT_Calicut_Logo.png",
    domainFallback: "nitc.ac.in",
    crestCode: "NC",
  },
  "vit-vellore": {
    themeColor: {
      primary: "#1E3A8A",
      glow: "rgba(30,58,138,0.30)",
      border: "rgba(30,58,138,0.55)",
      bgTint: "rgba(30,58,138,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Vellore_Institute_of_Technology_seal_2017.png/240px-Vellore_Institute_of_Technology_seal_2017.png",
    domainFallback: "vit.ac.in",
    crestCode: "VT",
  },
  "jadavpur-university": {
    themeColor: {
      primary: "#BE123C",
      glow: "rgba(190,18,60,0.30)",
      border: "rgba(190,18,60,0.55)",
      bgTint: "rgba(190,18,60,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Jadavpur_University_Logo.svg/240px-Jadavpur_University_Logo.svg.png",
    domainFallback: "jaduniv.edu.in",
    crestCode: "JU",
  },
  "anna-university": {
    themeColor: {
      primary: "#C2410C",
      glow: "rgba(194,65,12,0.30)",
      border: "rgba(194,65,12,0.55)",
      bgTint: "rgba(194,65,12,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Anna_University_Logo.svg/240px-Anna_University_Logo.svg.png",
    domainFallback: "annauniv.edu",
    crestCode: "AU",
  },
  "nit-rourkela": {
    themeColor: {
      primary: "#4F46E5",
      glow: "rgba(79,70,229,0.30)",
      border: "rgba(79,70,229,0.55)",
      bgTint: "rgba(79,70,229,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/NIT_Rourkela_Color_Logo.svg/240px-NIT_Rourkela_Color_Logo.svg.png",
    domainFallback: "nitrkl.ac.in",
    crestCode: "NR",
  },
  "iiit-hyderabad": {
    themeColor: {
      primary: "#2563EB",
      glow: "rgba(37,99,235,0.30)",
      border: "rgba(37,99,235,0.55)",
      bgTint: "rgba(37,99,235,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/IIIT_Hyderabad_Logo.svg/240px-IIIT_Hyderabad_Logo.svg.png",
    domainFallback: "iiit.ac.in",
    crestCode: "II",
  },

  // ══════════════════════════════════════════════════════════════════
  // 🇺🇸 UNITED STATES
  // ══════════════════════════════════════════════════════════════════
  "mit": {
    themeColor: {
      primary: "#A31F34",
      glow: "rgba(163,31,52,0.30)",
      border: "rgba(163,31,52,0.55)",
      bgTint: "rgba(163,31,52,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/240px-MIT_logo.svg.png",
    domainFallback: "mit.edu",
    crestCode: "MT",
  },
  "stanford": {
    themeColor: {
      primary: "#8C1515",
      glow: "rgba(140,21,21,0.30)",
      border: "rgba(140,21,21,0.55)",
      bgTint: "rgba(140,21,21,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Stanford_University.svg/240px-Seal_of_Stanford_University.svg.png",
    domainFallback: "stanford.edu",
    crestCode: "ST",
  },
  "uc-berkeley": {
    themeColor: {
      primary: "#003262",
      glow: "rgba(0,50,98,0.30)",
      border: "rgba(0,50,98,0.55)",
      bgTint: "rgba(0,50,98,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/240px-Seal_of_University_of_California%2C_Berkeley.svg.png",
    domainFallback: "berkeley.edu",
    crestCode: "UC",
  },
  "cmu": {
    themeColor: {
      primary: "#C41230",
      glow: "rgba(196,18,48,0.30)",
      border: "rgba(196,18,48,0.55)",
      bgTint: "rgba(196,18,48,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Carnegie_Mellon_University_seal.svg/240px-Carnegie_Mellon_University_seal.svg.png",
    domainFallback: "cmu.edu",
    crestCode: "CM",
  },
  "caltech": {
    themeColor: {
      primary: "#FF6C0C",
      glow: "rgba(255,108,12,0.30)",
      border: "rgba(255,108,12,0.55)",
      bgTint: "rgba(255,108,12,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Seal_of_the_California_Institute_of_Technology.svg/240px-Seal_of_the_California_Institute_of_Technology.svg.png",
    domainFallback: "caltech.edu",
    crestCode: "CT",
  },
  "georgia-tech": {
    themeColor: {
      primary: "#B3A369",
      glow: "rgba(179,163,105,0.30)",
      border: "rgba(179,163,105,0.55)",
      bgTint: "rgba(179,163,105,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Georgia_Tech_seal.svg/240px-Georgia_Tech_seal.svg.png",
    domainFallback: "gatech.edu",
    crestCode: "GT",
  },
  "uiuc": {
    themeColor: {
      primary: "#13294B",
      glow: "rgba(19,41,75,0.30)",
      border: "rgba(19,41,75,0.55)",
      bgTint: "rgba(19,41,75,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/University_of_Illinois_seal.svg/240px-University_of_Illinois_seal.svg.png",
    domainFallback: "illinois.edu",
    crestCode: "UI",
  },
  "harvard": {
    themeColor: {
      primary: "#A51C30",
      glow: "rgba(165,28,48,0.30)",
      border: "rgba(165,28,48,0.55)",
      bgTint: "rgba(165,28,48,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_w_border.svg/240px-Harvard_shield_w_border.svg.png",
    domainFallback: "harvard.edu",
    crestCode: "HV",
  },

  // ══════════════════════════════════════════════════════════════════
  // 🇬🇧 UNITED KINGDOM
  // ══════════════════════════════════════════════════════════════════
  "cambridge": {
    themeColor: {
      primary: "#0072CE",
      glow: "rgba(0,114,206,0.30)",
      border: "rgba(0,114,206,0.55)",
      bgTint: "rgba(0,114,206,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg/240px-Coat_of_Arms_of_the_University_of_Cambridge.svg.png",
    domainFallback: "cam.ac.uk",
    crestCode: "CB",
  },
  "oxford": {
    themeColor: {
      primary: "#002147",
      glow: "rgba(0,33,71,0.30)",
      border: "rgba(0,33,71,0.55)",
      bgTint: "rgba(0,33,71,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/240px-Oxford-University-Circlet.svg.png",
    domainFallback: "ox.ac.uk",
    crestCode: "OX",
  },
  "imperial-london": {
    themeColor: {
      primary: "#002E5D",
      glow: "rgba(0,46,93,0.30)",
      border: "rgba(0,46,93,0.55)",
      bgTint: "rgba(0,46,93,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Imperial_College_London_crest.svg/240px-Imperial_College_London_crest.svg.png",
    domainFallback: "imperial.ac.uk",
    crestCode: "IC",
  },
  "ucl": {
    themeColor: {
      primary: "#500778",
      glow: "rgba(80,7,120,0.30)",
      border: "rgba(80,7,120,0.55)",
      bgTint: "rgba(80,7,120,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/University_College_London_logo.svg/240px-University_College_London_logo.svg.png",
    domainFallback: "ucl.ac.uk",
    crestCode: "UC",
  },
  "edinburgh": {
    themeColor: {
      primary: "#041E42",
      glow: "rgba(4,30,66,0.30)",
      border: "rgba(4,30,66,0.55)",
      bgTint: "rgba(4,30,66,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/University_of_Edinburgh_ceremonial_roundel.svg/240px-University_of_Edinburgh_ceremonial_roundel.svg.png",
    domainFallback: "ed.ac.uk",
    crestCode: "ED",
  },
  "manchester": {
    themeColor: {
      primary: "#660099",
      glow: "rgba(102,0,153,0.30)",
      border: "rgba(102,0,153,0.55)",
      bgTint: "rgba(102,0,153,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/The_University_of_Manchester_logo.svg/240px-The_University_of_Manchester_logo.svg.png",
    domainFallback: "manchester.ac.uk",
    crestCode: "MN",
  },

  // ══════════════════════════════════════════════════════════════════
  // 🇩🇪 GERMANY
  // ══════════════════════════════════════════════════════════════════
  "tum": {
    themeColor: {
      primary: "#0065BD",
      glow: "rgba(0,101,189,0.30)",
      border: "rgba(0,101,189,0.55)",
      bgTint: "rgba(0,101,189,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Logo_of_the_Technical_University_of_Munich.svg/240px-Logo_of_the_Technical_University_of_Munich.svg.png",
    domainFallback: "tum.de",
    crestCode: "TM",
  },
  "rwth-aachen": {
    themeColor: {
      primary: "#00549F",
      glow: "rgba(0,84,159,0.30)",
      border: "rgba(0,84,159,0.55)",
      bgTint: "rgba(0,84,159,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/RWTH_Aachen_University_Logo.svg/240px-RWTH_Aachen_University_Logo.svg.png",
    domainFallback: "rwth-aachen.de",
    crestCode: "RW",
  },
  "kit": {
    themeColor: {
      primary: "#009682",
      glow: "rgba(0,150,130,0.30)",
      border: "rgba(0,150,130,0.55)",
      bgTint: "rgba(0,150,130,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Logo_KIT.svg/240px-Logo_KIT.svg.png",
    domainFallback: "kit.edu",
    crestCode: "KT",
  },
  "tu-berlin": {
    themeColor: {
      primary: "#C50E1F",
      glow: "rgba(197,14,31,0.30)",
      border: "rgba(197,14,31,0.55)",
      bgTint: "rgba(197,14,31,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/TU-Berlin-Logo.svg/240px-TU-Berlin-Logo.svg.png",
    domainFallback: "tu.berlin",
    crestCode: "TB",
  },

  // ══════════════════════════════════════════════════════════════════
  // 🇨🇦 CANADA
  // ══════════════════════════════════════════════════════════════════
  "toronto": {
    themeColor: {
      primary: "#002A5C",
      glow: "rgba(0,42,92,0.30)",
      border: "rgba(0,42,92,0.55)",
      bgTint: "rgba(0,42,92,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coat_of_arms.svg/240px-Utoronto_coat_of_arms.svg.png",
    domainFallback: "utoronto.ca",
    crestCode: "TO",
  },
  "ubc": {
    themeColor: {
      primary: "#002145",
      glow: "rgba(0,33,69,0.30)",
      border: "rgba(0,33,69,0.55)",
      bgTint: "rgba(0,33,69,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/University_of_British_Columbia_Coat_of_Arms.svg/240px-University_of_British_Columbia_Coat_of_Arms.svg.png",
    domainFallback: "ubc.ca",
    crestCode: "BC",
  },
  "waterloo": {
    themeColor: {
      primary: "#E03C31",
      glow: "rgba(224,60,49,0.30)",
      border: "rgba(224,60,49,0.55)",
      bgTint: "rgba(224,60,49,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/University_of_Waterloo_seal.svg/240px-University_of_Waterloo_seal.svg.png",
    domainFallback: "uwaterloo.ca",
    crestCode: "UW",
  },
  "mcgill": {
    themeColor: {
      primary: "#ED1B2F",
      glow: "rgba(237,27,47,0.30)",
      border: "rgba(237,27,47,0.55)",
      bgTint: "rgba(237,27,47,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/McGill_University_CoA.svg/240px-McGill_University_CoA.svg.png",
    domainFallback: "mcgill.ca",
    crestCode: "MG",
  },

  // ══════════════════════════════════════════════════════════════════
  // 🇦🇺 AUSTRALIA
  // ══════════════════════════════════════════════════════════════════
  "unsw": {
    themeColor: {
      primary: "#FFD100",
      glow: "rgba(255,209,0,0.30)",
      border: "rgba(255,209,0,0.55)",
      bgTint: "rgba(255,209,0,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/University_of_New_South_Wales_Coat_of_Arms.svg/240px-University_of_New_South_Wales_Coat_of_Arms.svg.png",
    domainFallback: "unsw.edu.au",
    crestCode: "SW",
  },
  "melbourne": {
    themeColor: {
      primary: "#094183",
      glow: "rgba(9,65,131,0.30)",
      border: "rgba(9,65,131,0.55)",
      bgTint: "rgba(9,65,131,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/University_of_Melbourne_Coat_of_Arms.svg/240px-University_of_Melbourne_Coat_of_Arms.svg.png",
    domainFallback: "unimelb.edu.au",
    crestCode: "UM",
  },
  "usyd": {
    themeColor: {
      primary: "#E64626",
      glow: "rgba(230,70,38,0.30)",
      border: "rgba(230,70,38,0.55)",
      bgTint: "rgba(230,70,38,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/University_of_Sydney_Coat_of_Arms.svg/240px-University_of_Sydney_Coat_of_Arms.svg.png",
    domainFallback: "sydney.edu.au",
    crestCode: "SY",
  },
  "anu": {
    themeColor: {
      primary: "#7B2D26",
      glow: "rgba(123,45,38,0.30)",
      border: "rgba(123,45,38,0.55)",
      bgTint: "rgba(123,45,38,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Australian_National_University_coat_of_arms.svg/240px-Australian_National_University_coat_of_arms.svg.png",
    domainFallback: "anu.edu.au",
    crestCode: "AN",
  },
  "monash": {
    themeColor: {
      primary: "#006DAE",
      glow: "rgba(0,109,174,0.30)",
      border: "rgba(0,109,174,0.55)",
      bgTint: "rgba(0,109,174,0.12)",
    },
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Monash_University_coat_of_arms.svg/240px-Monash_University_coat_of_arms.svg.png",
    domainFallback: "monash.edu",
    crestCode: "MN",
  },
};

export const DEFAULT_BRAND_PROFILE: UniversityBrandProfile = {
  themeColor: {
    primary: "#6366F1",
    glow: "rgba(99,102,241,0.30)",
    border: "rgba(99,102,241,0.55)",
    bgTint: "rgba(99,102,241,0.12)",
  },
  logoUrl: "",
  crestCode: "SG",
};
