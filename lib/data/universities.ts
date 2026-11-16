import type { University, CountryCode } from "@/types/university";
import { UNIVERSITY_BRANDS, DEFAULT_BRAND_PROFILE } from "./universityThemes";
import { universitiesIndia } from "./universitiesIndia";
import { universitiesUS } from "./universitiesUS";
import { universitiesUK } from "./universitiesUK";
import { universitiesCanada } from "./universitiesCanada";
import { universitiesGermany } from "./universitiesGermany";
import { universitiesAustralia } from "./universitiesAustralia";
import { universitiesOther } from "./universitiesOther";

const rawUniversities: University[] = [
  ...universitiesIndia,
  ...universitiesUS,
  ...universitiesUK,
  ...universitiesCanada,
  ...universitiesGermany,
  ...universitiesAustralia,
  ...universitiesOther,
];

const OFFICIAL_INSTITUTION_DOMAINS: Record<string, string> = {
  // United Kingdom
  imperial: "imperial.ac.uk",
  "imperial-london": "imperial.ac.uk",
  oxford: "ox.ac.uk",
  cambridge: "cam.ac.uk",
  ucl: "ucl.ac.uk",
  edinburgh: "ed.ac.uk",
  manchester: "manchester.ac.uk",
  "king-s-college": "kcl.ac.uk",
  kcl: "kcl.ac.uk",
  lse: "lse.ac.uk",
  bristol: "bristol.ac.uk",
  warwick: "warwick.ac.uk",
  glasgow: "gla.ac.uk",
  birmingham: "bham.ac.uk",
  southampton: "southampton.ac.uk",
  leeds: "leeds.ac.uk",
  sheffield: "sheffield.ac.uk",

  // United States
  mit: "mit.edu",
  harvard: "harvard.edu",
  stanford: "stanford.edu",
  caltech: "caltech.edu",
  columbia: "columbia.edu",
  cornell: "cornell.edu",
  princeton: "princeton.edu",
  yale: "yale.edu",
  cmu: "cmu.edu",
  berkeley: "berkeley.edu",
  ucla: "ucla.edu",
  ucsd: "ucsd.edu",
  umich: "umich.edu",
  gatech: "gatech.edu",
  uiuc: "illinois.edu",
  utexas: "utexas.edu",
  purdue: "purdue.edu",
  nyu: "nyu.edu",
  upenn: "upenn.edu",
  duke: "duke.edu",
  northwestern: "northwestern.edu",
  jhu: "jhu.edu",

  // Canada
  "ca-u-of-t": "utoronto.ca",
  utoronto: "utoronto.ca",
  toronto: "utoronto.ca",
  "ca-mcgill": "mcgill.ca",
  mcgill: "mcgill.ca",
  "ca-ubc": "ubc.ca",
  ubc: "ubc.ca",
  "ca-waterloo": "uwaterloo.ca",
  waterloo: "uwaterloo.ca",
  "ca-alberta": "ualberta.ca",
  "ca-mcmaster": "mcmaster.ca",
  "ca-queens": "queensu.ca",
  "ca-western": "uwo.ca",

  // Germany
  "de-tum": "tum.de",
  tum: "tum.de",
  "de-lmu": "lmu.de",
  lmu: "lmu.de",
  "de-heidelberg": "uni-heidelberg.de",
  "de-rwth": "rwth-aachen.de",
  "de-kit": "kit.edu",
  "de-tu-berlin": "tu.berlin",
  "de-hu-berlin": "hu-berlin.de",
  "de-fu-berlin": "fu-berlin.de",
  "de-tu-dresden": "tu-dresden.de",
  "de-tu-darmstadt": "tu-darmstadt.de",

  // Australia
  "au-unimelb": "unimelb.edu.au",
  unimelb: "unimelb.edu.au",
  "au-sydney": "sydney.edu.au",
  "au-unsw": "unsw.edu.au",
  "au-anu": "anu.edu.au",
  "au-monash": "monash.edu",
  "au-uq": "uq.edu.au",
  "au-adelaide": "adelaide.edu.au",
  "au-uwa": "uwa.edu.au",

  // India - IITs, NITs, IIITs & Private Tier-1
  "iit-bombay": "iitb.ac.in",
  iitb: "iitb.ac.in",
  "iit-delhi": "iitd.ac.in",
  iitd: "iitd.ac.in",
  "iit-madras": "iitm.ac.in",
  iitm: "iitm.ac.in",
  "iit-kanpur": "iitk.ac.in",
  iitk: "iitk.ac.in",
  "iit-kharagpur": "iitkgp.ac.in",
  iitkgp: "iitkgp.ac.in",
  "iit-roorkee": "iitr.ac.in",
  iitr: "iitr.ac.in",
  "iit-guwahati": "iitg.ac.in",
  iitg: "iitg.ac.in",
  "iit-hyderabad": "iith.ac.in",
  iith: "iith.ac.in",
  "iit-bhu": "iitbhu.ac.in",
  iitbhu: "iitbhu.ac.in",
  "iit-indore": "iiti.ac.in",
  "iit-ropar": "iitrpr.ac.in",
  "iit-patna": "iitp.ac.in",
  "iit-gandhinagar": "iitgn.ac.in",
  "iit-jodhpur": "iitj.ac.in",
  "iit-mandi": "iitmandi.ac.in",
  "iit-ism-dhanbad": "iitism.ac.in",
  iisc: "iisc.ac.in",
  "iisc-bangalore": "iisc.ac.in",
  "nit-trichy": "nitt.edu",
  nitt: "nitt.edu",
  "nit-surathkal": "nitk.ac.in",
  nitk: "nitk.ac.in",
  "nit-warangal": "nitw.ac.in",
  nitw: "nitw.ac.in",
  "nit-rourkela": "nitrkl.ac.in",
  "nit-calicut": "nitc.ac.in",
  "mnnit-allahabad": "mnnit.ac.in",
  "vnit-nagpur": "vnit.ac.in",
  "iiit-hyderabad": "iiit.ac.in",
  iiith: "iiit.ac.in",
  "iiit-bangalore": "iiitb.ac.in",
  "iiit-delhi": "iiitd.ac.in",
  "bits-pilani": "bits-pilani.ac.in",
  bits: "bits-pilani.ac.in",
  "vit-vellore": "vit.ac.in",
  vit: "vit.ac.in",
  srmist: "srmist.edu.in",
  srm: "srmist.edu.in",
  manipal: "manipal.edu",
  mitwpu: "mitwpu.edu.in",
  thapar: "thapar.edu",
  dtu: "dtu.ac.in",
  nsut: "nsut.ac.in",
  jadavpur: "jadavpuruniversity.in",
  "anna-university": "annauniv.edu",
  amrita: "amrita.edu",
  "kiit-bhubaneswar": "kiit.ac.in",
  "soa-bhubaneswar": "soa.ac.in",
  "chandigarh-university": "cuchd.in",
  lpu: "lpu.in",
  "amity-noida": "amity.edu",
  "ashoka-university": "ashoka.edu.in",
  "shiv-nadar": "snu.edu.in",
  "pes-university": "pes.edu",
  rvce: "rvce.edu.in",
  bmsce: "bmsce.ac.in",
  msrit: "msrit.edu",
};

const PORTAL_SUBDOMAIN_PREFIXES = [
  "www.",
  "admissions.",
  "admission.",
  "apply.",
  "portal.",
  "ug.",
  "pg.",
  "grad.",
  "graduate.",
  "undergrad.",
  "international.",
  "study.",
  "online.",
  "my.",
  "web.",
];

function stripPortalSubdomains(hostname: string): string {
  let clean = hostname.toLowerCase().trim();
  for (const prefix of PORTAL_SUBDOMAIN_PREFIXES) {
    if (clean.startsWith(prefix)) {
      const candidate = clean.slice(prefix.length);
      if (candidate.split(".").length >= 2 && !/^(ac|edu|gov|org|co)\.[a-z]{2}$/.test(candidate)) {
        clean = candidate;
      }
    }
  }
  return clean;
}

function extractCleanDomain(u: University, brandFallback?: string): string {
  const idKey = u.id.toLowerCase().trim();
  const shortKey = u.shortName?.toLowerCase().trim() || "";

  let raw =
    OFFICIAL_INSTITUTION_DOMAINS[idKey] ||
    (shortKey ? OFFICIAL_INSTITUTION_DOMAINS[shortKey] : "");

  if (!raw && brandFallback) {
    raw = brandFallback;
  } else if (!raw && u.domain) {
    raw = u.domain;
  } else if (!raw && u.logoUrl) {
    if (u.logoUrl.includes("url=")) {
      const match = u.logoUrl.match(/[?&]url=([^&]+)/);
      if (match) {
        try {
          raw = decodeURIComponent(match[1]);
        } catch {
          raw = match[1];
        }
      }
    }
    if (!raw && u.logoUrl.includes("domain=")) {
      const match = u.logoUrl.match(/[?&]domain=([^&]+)/);
      if (match) raw = match[1];
    }
    if (!raw && u.logoUrl.includes("logo.clearbit.com/")) {
      raw = u.logoUrl.split("logo.clearbit.com/")[1];
    }
  }

  if (!raw && u.applicationPortal && u.applicationPortal.includes(".")) {
    try {
      const url = u.applicationPortal.startsWith("http")
        ? u.applicationPortal
        : `https://${u.applicationPortal}`;
      raw = new URL(url).hostname;
    } catch {
      // ignore malformed URL
    }
  }

  const sanitized = (raw || "")
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .split("?")[0]
    .split(":")[0]
    .trim()
    .toLowerCase();

  return sanitized ? stripPortalSubdomains(sanitized) : "";
}

const seenIds = new Set<string>();
const uniqueRawUniversities = rawUniversities.filter((u) => {
  if (seenIds.has(u.id)) {
    return false;
  }
  seenIds.add(u.id);
  return true;
});

export const universities: University[] = uniqueRawUniversities.map((u) => {
  const brand = UNIVERSITY_BRANDS[u.id];
  const domain = extractCleanDomain(u, brand?.domainFallback);

  const primaryLogo = domain
    ? `https://logo.clearbit.com/${domain}`
    : u.logoUrl || DEFAULT_BRAND_PROFILE.logoUrl;

  const themeColor = brand?.themeColor || u.themeColor || DEFAULT_BRAND_PROFILE.themeColor;

  return {
    ...u,
    domain: domain || undefined,
    themeColor,
    logoUrl: primaryLogo,
  };
});

export function getUniversitiesByCountry(countryCode: CountryCode): University[] {
  return universities.filter((u) => u.countryCode === countryCode);
}

export function getGlobalTopUniversities(): University[] {
  return [...universities].sort((a, b) => a.globalRankQS - b.globalRankQS);
}

export function getAllUniversities(): University[] {
  return universities;
}

export const UNIVERSITIES: University[] = universities;
export const LAST_DATA_SYNC = "2026-11-16T21:00:00.000Z";
