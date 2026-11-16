export type CountryCode = "IN" | "US" | "GB" | "DE" | "CA" | "AU" | "SG";

export interface BranchCutoff {
  branchName: string;
  primaryExam: string;
  benchmark: string;
  categoryOrQuota?: string;
}

export interface UniversityThemeColor {
  primary: string;
  glow: string;
  border: string;
  bgTint: string;
}

export interface PlacementMetrics {
  medianSalary: string;
  averageSalary: string;
  highestPackage: {
    domestic: string;
    international?: string;
  };
  placementRate: number;
  ppoRate?: number;
  topRecruiters: string[];
  workVisaSupport: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state?: string;
  countryCode: CountryCode;
  countryName: string;
  nationalRank: number;
  rankingBody: string;
  globalRankQS: number;
  acceptanceRate: string;
  tuitionAnnual: {
    localCurrency: string;
    localAmount: string;
    inrEquivalent: string;
  };
  medianPackage: {
    localCurrency: string;
    localAmount: string;
    inrEquivalent: string;
  };
  acceptedExams: string[];
  upcomingDeadlines: {
    title: string;
    dateOrWindow: string;
  }[];
  branchCutoffs: BranchCutoff[];
  admissionRoute: string;
  keyStrengths?: string[];
  pros: string[];
  cons: string[];
  requiredDocs: string[];
  applicationTemplate: string;
  logoUrl?: string;
  domain?: string;
  themeColor?: UniversityThemeColor;
  qsRank?: number;
  annualTuition?: string;
  medianPlacement?: string;
  cutoffScore?: string;
  applicationPortal?: string;
  placementMetrics?: PlacementMetrics;
}

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  targetDegree: string;
  boardPercentage: number;
  primaryExam: string;
  examScoreOrRank: string;
  skills?: string[];
  targetCountries?: CountryCode[];
  resumeFileName?: string;
  resumeUploadedAt?: string;
}

export type FitCategory = "Target Choice" | "Competitive Fit" | "Reach School";

export interface RankedUniversity extends University {
  fit?: FitCategory;
}
