"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type CountryCode = "IN" | "US" | "GB" | "DE" | "CA" | "AU" | "SG";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  timezone: string[];
}

export const COUNTRIES: Country[] = [
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    timezone: ["Asia/Kolkata", "Asia/Calcutta"],
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    timezone: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Phoenix",
      "America/Anchorage",
      "Pacific/Honolulu",
      "America/Detroit",
      "America/Boise",
      "America/Indiana",
      "America/Kentucky",
      "America/North_Dakota",
      "US/",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    timezone: ["Europe/London", "Europe/Belfast", "GB"],
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    timezone: ["Europe/Berlin", "Europe/Busingen"],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    timezone: [
      "America/Toronto",
      "America/Vancouver",
      "America/Edmonton",
      "America/Winnipeg",
      "America/Halifax",
      "America/St_Johns",
      "America/Regina",
      "Canada/",
    ],
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    timezone: [
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Brisbane",
      "Australia/Perth",
      "Australia/Adelaide",
      "Australia/Hobart",
      "Australia/Darwin",
      "Australia/",
    ],
  },
];

const STORAGE_KEY = "findmycampus_country";

function detectCountryFromTimezone(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "IN";

    // Direct check for India
    if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
      return "IN";
    }

    // Direct check for Germany
    if (tz.includes("Berlin") || tz.includes("Busingen")) {
      return "DE";
    }

    // Direct check for UK
    if (tz.includes("London") || tz.includes("Belfast") || tz === "GB") {
      return "GB";
    }

    // Direct check for Australia
    if (tz.startsWith("Australia/") || tz.includes("Sydney") || tz.includes("Melbourne")) {
      return "AU";
    }

    // Check Canada first before generic America/
    const canadianTimezones = [
      "America/Toronto",
      "America/Vancouver",
      "America/Edmonton",
      "America/Winnipeg",
      "America/Halifax",
      "America/St_Johns",
      "America/Regina",
      "Canada/",
    ];
    if (canadianTimezones.some((ctz) => tz.startsWith(ctz) || tz === ctz)) {
      return "CA";
    }

    // Any other America/ or US/ timezone defaults to United States
    if (tz.startsWith("America/") || tz.startsWith("US/")) {
      return "US";
    }

    // Array check
    for (const country of COUNTRIES) {
      if (country.timezone.some((t) => tz.startsWith(t) || t === tz)) {
        return country.code;
      }
    }
  } catch {
    // fallback
  }
  return "IN";
}

interface CountryContextValue {
  country: Country;
  setCountry: (code: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
    if (stored === ("SG" as any)) {
      setCountryCode("IN");
      localStorage.setItem(STORAGE_KEY, "IN");
    } else if (stored && COUNTRIES.some((c) => c.code === stored)) {
      setCountryCode(stored);
    } else {
      setCountryCode(detectCountryFromTimezone());
    }
  }, []);

  const setCountry = useCallback((code: CountryCode) => {
    setCountryCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return ctx;
}
