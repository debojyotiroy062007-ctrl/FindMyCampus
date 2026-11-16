"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { University } from "@/types/university";

interface UniversityLogoProps {
  university: Pick<University, "id" | "name" | "shortName" | "domain" | "logoUrl" | "themeColor">;
  size?: number;
  className?: string;
}

const RESOLVED_LOGO_CACHE = new Map<string, string | null>();

// Exact Wikipedia canonical article titles (served from Wikimedia's fast edge-cached REST Summary API)
const WIKI_CANONICAL_TITLES: Record<string, string> = {
  // India
  "iit-madras": "Indian_Institute_of_Technology_Madras",
  iitm: "Indian_Institute_of_Technology_Madras",
  "iit-delhi": "Indian_Institute_of_Technology_Delhi",
  iitd: "Indian_Institute_of_Technology_Delhi",
  "iit-bombay": "Indian_Institute_of_Technology_Bombay",
  iitb: "Indian_Institute_of_Technology_Bombay",
  "iit-kanpur": "Indian_Institute_of_Technology_Kanpur",
  iitk: "Indian_Institute_of_Technology_Kanpur",
  "iit-kharagpur": "Indian_Institute_of_Technology_Kharagpur",
  iitkgp: "Indian_Institute_of_Technology_Kharagpur",
  "iit-roorkee": "Indian_Institute_of_Technology_Roorkee",
  iitr: "Indian_Institute_of_Technology_Roorkee",
  "iit-guwahati": "Indian_Institute_of_Technology_Guwahati",
  iitg: "Indian_Institute_of_Technology_Guwahati",
  "iit-hyderabad": "Indian_Institute_of_Technology_Hyderabad",
  iith: "Indian_Institute_of_Technology_Hyderabad",
  "iit-bhu": "Indian_Institute_of_Technology_(BHU)_Varanasi",
  "iit-indore": "Indian_Institute_of_Technology_Indore",
  "iit-ropar": "Indian_Institute_of_Technology_Ropar",
  "iit-patna": "Indian_Institute_of_Technology_Patna",
  "iit-gandhinagar": "Indian_Institute_of_Technology_Gandhinagar",
  "iit-jodhpur": "Indian_Institute_of_Technology_Jodhpur",
  "iit-mandi": "Indian_Institute_of_Technology_Mandi",
  "iit-ism-dhanbad": "Indian_Institute_of_Technology_(ISM)_Dhanbad",
  iisc: "Indian_Institute_of_Science",
  "iisc-bangalore": "Indian_Institute_of_Science",
  "nit-trichy": "National_Institute_of_Technology,_Tiruchirappalli",
  nitt: "National_Institute_of_Technology,_Tiruchirappalli",
  "nit-surathkal": "National_Institute_of_Technology_Karnataka",
  nitk: "National_Institute_of_Technology_Karnataka",
  "nit-warangal": "National_Institute_of_Technology,_Warangal",
  nitw: "National_Institute_of_Technology,_Warangal",
  "nit-rourkela": "National_Institute_of_Technology,_Rourkela",
  "nit-calicut": "National_Institute_of_Technology_Calicut",
  "nit-silchar": "National_Institute_of_Technology,_Silchar",
  "iiit-hyderabad": "International_Institute_of_Information_Technology,_Hyderabad",
  "iiit-bangalore": "International_Institute_of_Information_Technology,_Bangalore",
  "iiit-delhi": "Indraprastha_Institute_of_Information_Technology,_Delhi",
  "bits-pilani": "BITS_Pilani",
  bits: "BITS_Pilani",
  srmist: "SRM_Institute_of_Science_and_Technology",
  srm: "SRM_Institute_of_Science_and_Technology",
  "vit-vellore": "Vellore_Institute_of_Technology",
  vit: "Vellore_Institute_of_Technology",
  dtu: "Delhi_Technological_University",
  nsut: "Netaji_Subhas_University_of_Technology",
  jadavpur: "Jadavpur_University",
  "iiest-shibpur": "Indian_Institute_of_Engineering_Science_and_Technology,_Shibpur",
  manipal: "Manipal_Academy_of_Higher_Education",
  thapar: "Thapar_Institute_of_Engineering_and_Technology",
  amrita: "Amrita_Vishwa_Vidyapeetham",
  "anna-university": "Anna_University",
  "vel-tech": "Vel_Tech_Rangarajan_Dr._Sagunthala_R&D_Institute_of_Science_and_Technology",
  "iiitm-gwalior": "Atal_Bihari_Vajpayee_Indian_Institute_of_Information_Technology_and_Management,_Gwalior",
  "iiitdm-jabalpur": "Indian_Institute_of_Information_Technology,_Design_and_Manufacturing,_Jabalpur",
  "uiet-chandigarh": "University_Institute_of_Engineering_and_Technology,_Panjab_University",
  // International
  mit: "Massachusetts_Institute_of_Technology",
  stanford: "Stanford_University",
  harvard: "Harvard_University",
  caltech: "California_Institute_of_Technology",
  berkeley: "University_of_California,_Berkeley",
  ucla: "University_of_California,_Los_Angeles",
  cmu: "Carnegie_Mellon_University",
  gatech: "Georgia_Tech",
  umich: "University_of_Michigan",
  "imperial-london": "Imperial_College_London",
  imperial: "Imperial_College_London",
  oxford: "University_of_Oxford",
  cambridge: "University_of_Cambridge",
  ucl: "University_College_London",
  "ca-u-of-t": "University_of_Toronto",
  "ca-ubc": "University_of_British_Columbia",
  "ca-mcgill": "McGill_University",
  "ca-waterloo": "University_of_Waterloo",
  "de-tum": "Technical_University_of_Munich",
  "de-lmu": "Ludwig_Maximilian_University_of_Munich",
  "de-rwth": "RWTH_Aachen_University",
  "au-unimelb": "University_of_Melbourne",
  "au-sydney": "University_of_Sydney",
  "au-unsw": "UNSW_Sydney",
};

const STOP_WORDS = new Set(["of", "the", "and", "at", "in", "for", "institute", "university", "college"]);

function getMonogram(u: UniversityLogoProps["university"]): string {
  if (u.shortName && u.shortName.trim().length >= 2 && u.shortName.trim().length <= 6) {
    return u.shortName.trim().toUpperCase();
  }
  const words = u.name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length >= 2) {
    return words
      .slice(0, 4)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return u.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "UNI";
}

function getCleanHostname(domain?: string, logoUrl?: string): string {
  if (domain && domain.includes(".")) {
    return domain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].trim();
  }
  if (logoUrl) {
    if (logoUrl.includes("logo.clearbit.com/")) {
      return logoUrl.split("logo.clearbit.com/")[1].split("?")[0].trim();
    }
    const urlMatch = logoUrl.match(/[?&](?:url|domain)=([^&]+)/);
    if (urlMatch) {
      try {
        return decodeURIComponent(urlMatch[1])
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0]
          .trim();
      } catch {
        return "";
      }
    }
  }
  return "";
}

function getWikiSlug(u: UniversityLogoProps["university"]): string {
  const idKey = u.id.toLowerCase().trim();
  const shortKey = u.shortName?.toLowerCase().trim() || "";
  if (WIKI_CANONICAL_TITLES[idKey]) return WIKI_CANONICAL_TITLES[idKey];
  if (shortKey && WIKI_CANONICAL_TITLES[shortKey]) return WIKI_CANONICAL_TITLES[shortKey];

  return u.name
    .split(" - ")[0]
    .split(" – ")[0]
    .replace(/\s*\([^)]*Campus[^)]*\)/i, "")
    .trim()
    .replace(/\s+/g, "_");
}

// Fast edge-cached REST summary lookup (zero rate limits, full CORS support)
async function fetchEdgeWikiLogo(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const thumb = data?.thumbnail;
    if (!thumb?.source) return null;

    const srcLower = thumb.source.toLowerCase();
    const ratio = thumb.width && thumb.height ? thumb.width / thumb.height : 1;
    const isExplicitEmblem = /logo|seal|crest|emblem|arms|insignia|monogram|shield/.test(srcLower);

    // Accept explicit logos of any reasonable aspect ratio, or square-ish infobox emblems
    if (isExplicitEmblem && ratio >= 0.4 && ratio <= 3.5) {
      return thumb.source;
    }
    if (ratio >= 0.72 && ratio <= 1.38 && !/campus|building|gate|hall|aerial|statue|library/.test(srcLower)) {
      return thumb.source;
    }
  } catch {
    // Fall through to high-res domain icon
  }
  return null;
}

export function UniversityLogo({
  university,
  size = 48,
  className,
}: UniversityLogoProps) {
  const [wikiSrc, setWikiSrc] = useState<string | null>(() =>
    RESOLVED_LOGO_CACHE.has(university.id) ? RESOLVED_LOGO_CACHE.get(university.id) ?? null : null
  );
  const [wikiChecked, setWikiChecked] = useState<boolean>(() => RESOLVED_LOGO_CACHE.has(university.id));
  const [fallbackStep, setFallbackStep] = useState<number>(0);

  const accentHex =
    typeof university.themeColor === "string"
      ? university.themeColor
      : university.themeColor?.primary || "#4f46e5";

  useEffect(() => {
    let cancelled = false;
    setFallbackStep(0);

    if (RESOLVED_LOGO_CACHE.has(university.id)) {
      setWikiSrc(RESOLVED_LOGO_CACHE.get(university.id) ?? null);
      setWikiChecked(true);
      return;
    }

    setWikiChecked(false);
    const slug = getWikiSlug(university);

    fetchEdgeWikiLogo(slug).then((url) => {
      if (cancelled) return;
      RESOLVED_LOGO_CACHE.set(university.id, url);
      setWikiSrc(url);
      setWikiChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [university]);

  const host = useMemo(
    () => getCleanHostname(university.domain, university.logoUrl),
    [university.domain, university.logoUrl]
  );

  // Build ordered candidate URLs: 1) Wikipedia Crest -> 2) Google FaviconV2 256px -> 3) DuckDuckGo Icon -> 4) Monogram
  const candidates = useMemo(() => {
    const urls: string[] = [];
    if (wikiSrc) urls.push(wikiSrc);
    if (wikiChecked && host) {
      urls.push(
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          `https://${host}`
        )}&size=256`
      );
      urls.push(`https://icons.duckduckgo.com/ip3/${host}.ico`);
    }
    return urls;
  }, [wikiSrc, wikiChecked, host]);

  const activeSrc = candidates[fallbackStep] || null;
  const monogram = useMemo(() => getMonogram(university), [university]);

  const advance = () => {
    if (wikiSrc && fallbackStep === 0) {
      RESOLVED_LOGO_CACHE.set(university.id, null);
    }
    setFallbackStep((s) => s + 1);
  };

  if (!activeSrc) {
    const fontSize =
      monogram.length >= 4
        ? Math.max(10, Math.round(size * 0.27))
        : Math.max(12, Math.round(size * 0.34));
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: `${accentHex}18`,
          borderColor: `${accentHex}45`,
          color: accentHex,
        }}
        className={cn(
          "rounded-xl border flex items-center justify-center font-extrabold tracking-tight select-none shrink-0 shadow-2xs",
          className
        )}
        title={university.name}
        aria-label={university.name}
      >
        <span style={{ fontSize }} className="leading-none font-mono">
          {monogram}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "rounded-xl bg-white border border-slate-200 dark:border-zinc-700/80 p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs",
        className
      )}
      title={university.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={activeSrc}
        src={activeSrc}
        alt={`${university.name} logo`}
        width={size - 12}
        height={size - 12}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain"
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          // Reject only 16x16 generic blank globes; keep valid 32px+ icons and horizontal crests
          if (naturalWidth <= 16 || naturalHeight <= 16) {
            advance();
          }
        }}
        onError={advance}
      />
    </div>
  );
}

export default UniversityLogo;