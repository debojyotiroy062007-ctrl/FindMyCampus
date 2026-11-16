import { universities } from "@/lib/data/universities";
import type { University, UserProfile, FitCategory } from "@/types/university";

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
  SG: "🇸🇬",
  CH: "🇨🇭",
};

/**
 * Extracts numeric value from a string (e.g. "AIR 148", "99.5 %ile", "Score: 330")
 */
function extractNumber(str: string): number | null {
  if (!str) return null;
  const cleaned = str.replace(/,/g, "");
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Deterministically evaluates candidate fit category for a university
 */
export function evaluateCandidateFit(profile: UserProfile | undefined, u: University): FitCategory {
  if (!profile) return "Competitive Fit";

  const userExam = (profile.primaryExam || "").toLowerCase().trim();
  const rawScore = profile.examScoreOrRank ? profile.examScoreOrRank.trim() : "";
  const userNum = extractNumber(rawScore);
  const userBoard = profile.boardPercentage || 85;

  const relevantCutoff =
    u.branchCutoffs?.find((b) =>
      b.primaryExam.toLowerCase().includes(userExam) ||
      userExam.includes(b.primaryExam.toLowerCase())
    ) || u.branchCutoffs?.[0];

  const benchNum = relevantCutoff ? extractNumber(relevantCutoff.benchmark) : null;

  // JEE Advanced (Rank: lower = better)
  if (userExam.includes("adv")) {
    if (u.acceptedExams?.some((e) => e.toLowerCase().includes("adv"))) {
      if (userNum && benchNum) {
        if (userNum <= benchNum * 0.85) return "Target Choice";
        if (userNum <= benchNum * 1.35) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // JEE Main (Rank or Percentile)
  if (userExam.includes("main") || userExam === "jee") {
    if (u.acceptedExams?.some((e) => e.toLowerCase().includes("main"))) {
      if (userNum && benchNum) {
        if (userNum <= 100 && benchNum <= 100) {
          if (userNum >= benchNum + 0.3) return "Target Choice";
          if (userNum >= benchNum - 0.5) return "Competitive Fit";
          return "Reach School";
        }
        if (userNum > 100) {
          if (userNum <= benchNum * 0.85) return "Target Choice";
          if (userNum <= benchNum * 1.35) return "Competitive Fit";
          return "Reach School";
        }
      }
    }
  }

  // BITSAT (Score: higher = better)
  if (userExam.includes("bitsat")) {
    if (u.acceptedExams?.some((e) => e.toLowerCase().includes("bitsat"))) {
      if (userNum && benchNum) {
        if (userNum >= benchNum + 10) return "Target Choice";
        if (userNum >= benchNum - 25) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // SAT (Score: max 1600)
  if (userExam.includes("sat")) {
    if (userNum) {
      if (userNum >= 1530) return "Target Choice";
      if (userNum >= 1450) return "Competitive Fit";
      return "Reach School";
    }
  }

  // Board percentage fallback
  if (userBoard >= 95) {
    if (u.nationalRank <= 3) return "Competitive Fit";
    return "Target Choice";
  } else if (userBoard >= 88) {
    if (u.nationalRank <= 5) return "Reach School";
    if (u.nationalRank <= 15) return "Competitive Fit";
    return "Target Choice";
  } else if (userBoard >= 75) {
    if (u.nationalRank <= 10) return "Reach School";
    return "Competitive Fit";
  }

  return "Reach School";
}

/**
 * Searches the 600+ university dataset for exact or fuzzy mentions in the user prompt
 */
export function retrieveContextForQuery(
  query: string,
  userProfile?: UserProfile
): {
  matchedUniversities: University[];
  isAdvisory: boolean;
  recommendedSets?: { reach: University[]; target: University[]; safe: University[] };
} {
  const lowerQuery = query.toLowerCase();

  // 1. Direct name/ID matching
  const directMatches = new Map<string, University>();

  for (const u of universities) {
    const id = u.id.toLowerCase();
    const name = u.name.toLowerCase();
    const shortName = u.shortName.toLowerCase();

    // Check specific name matches (longer first to prevent partial collision)
    if (
      lowerQuery.includes(name) ||
      (shortName.length >= 3 && new RegExp(`\\b${shortName}\\b`, "i").test(query)) ||
      (id.length >= 3 && new RegExp(`\\b${id}\\b`, "i").test(query))
    ) {
      directMatches.set(u.id, u);
    }
  }

  // Check aliases (e.g. "bits pilani" -> bits-pilani, "iitb" -> iit-bombay, etc.)
  const aliasMap: Record<string, string> = {
    "bits pilani": "bits-pilani",
    "bits": "bits-pilani",
    "pilani": "bits-pilani",
    "iitb": "iit-bombay",
    "iit bombay": "iit-bombay",
    "iitd": "iit-delhi",
    "iit delhi": "iit-delhi",
    "iitm": "iit-madras",
    "iit madras": "iit-madras",
    "iitk": "iit-kanpur",
    "iit kanpur": "iit-kanpur",
    "iitkgp": "iit-kharagpur",
    "iit kharagpur": "iit-kharagpur",
    "iitr": "iit-roorkee",
    "iit roorkee": "iit-roorkee",
    "iitg": "iit-guwahati",
    "iit guwahati": "iit-guwahati",
    "iith": "iit-hyderabad",
    "iit hyderabad": "iit-hyderabad",
    "iit bhu": "iit-bhu",
    "bhu": "iit-bhu",
    "nit trichy": "nit-trichy",
    "nitt": "nit-trichy",
    "nit surathkal": "nit-surathkal",
    "nitk": "nit-surathkal",
    "nit warangal": "nit-warangal",
    "nitw": "nit-warangal",
    "imperial": "imperial",
    "imperial college": "imperial",
    "oxford": "oxford",
    "oxford university": "oxford",
    "cambridge": "cambridge",
    "cambridge university": "cambridge",
    "mit": "mit",
    "harvard": "harvard",
    "stanford": "stanford",
    "caltech": "caltech",
    "toronto": "ca-u-of-t",
    "u of t": "ca-u-of-t",
    "mcgill": "ca-mcgill",
    "waterloo": "ca-waterloo",
    "tum": "de-tum",
    "tu munich": "de-tum",
    "melbourne": "au-unimelb",
    "unimelb": "au-unimelb",
    "sydney": "au-sydney",
    "unsw": "au-unsw",
  };

  for (const [alias, targetId] of Object.entries(aliasMap)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(query)) {
      const found = universities.find((u) => u.id === targetId);
      if (found) directMatches.set(found.id, found);
    }
  }

  // 2. Detect Advisory Intent
  const advisoryTriggers = [
    "what college",
    "what should i",
    "which college",
    "which university",
    "where can i get",
    "where do i have",
    "recommend",
    "my rank is",
    "percentile",
    "my score is",
    "chance of getting",
    "eligible for",
    "best options",
    "suggest",
  ];
  const isAdvisory = advisoryTriggers.some((t) => lowerQuery.includes(t));

  let recommendedSets: { reach: University[]; target: University[]; safe: University[] } | undefined;

  if (isAdvisory || directMatches.size === 0) {
    // Determine active target countries or default to user preference
    const preferredCountries = userProfile?.targetCountries?.length
      ? userProfile.targetCountries
      : ["IN", "US", "GB", "DE", "CA", "AU"];

    const pool = universities.filter((u) => preferredCountries.includes(u.countryCode));

    const reach: University[] = [];
    const target: University[] = [];
    const safe: University[] = [];

    for (const u of pool) {
      const fit = evaluateCandidateFit(userProfile, u);
      if (fit === "Reach School" && reach.length < 3) reach.push(u);
      else if (fit === "Target Choice" && target.length < 3) target.push(u);
      else if (fit === "Competitive Fit" && safe.length < 3) safe.push(u);
      if (reach.length >= 3 && target.length >= 3 && safe.length >= 3) break;
    }

    recommendedSets = { reach, target, safe };
  }

  return {
    matchedUniversities: Array.from(directMatches.values()),
    isAdvisory,
    recommendedSets,
  };
}

/**
 * Builds a dense, factual Markdown grounding context block for Gemini 3.5 Flash-Lite
 */
export function buildGroundingContext(
  matchedUniversities: University[],
  userProfile?: UserProfile,
  recommendedSets?: { reach: University[]; target: University[]; safe: University[] }
): string {
  const sections: string[] = [];

  // Candidate Profile Snapshot
  if (userProfile) {
    sections.push(`
### CANDIDATE PROFILE SNAPSHOT:
- **Name**: ${userProfile.name || "Candidate"}
- **Target Degree**: ${userProfile.targetDegree || "Computer Science / Engineering"}
- **12th Board Aggregate**: ${userProfile.boardPercentage || "Not provided"}%
- **Primary Entrance Exam**: ${userProfile.primaryExam || "Not provided"}
- **Score / AIR**: ${userProfile.examScoreOrRank || "Not provided"}
- **Target Countries**: ${(userProfile.targetCountries || ["IN", "US", "GB"]).join(", ")}
`);
  }

  // Exact Matched Universities
  if (matchedUniversities.length > 0) {
    sections.push(`
### VERIFIED INSTITUTION DOSSIERS (${matchedUniversities.length} matched):
${matchedUniversities
  .map((u) => {
    const flag = COUNTRY_FLAGS[u.countryCode] || "🌐";
    const p = u.placementMetrics;
    const cutoffs = u.branchCutoffs
      ?.slice(0, 4)
      .map((b) => `  * ${b.branchName}: ${b.benchmark} (${b.primaryExam})`)
      .join("\n");
    const deadlines = u.upcomingDeadlines
      ?.slice(0, 2)
      .map((d) => `  * ${d.title}: ${d.dateOrWindow}`)
      .join("\n");

    return `
#### ${flag} ${u.name} (${u.shortName})
- **Location**: ${u.city}, ${u.countryName}
- **Official Ranks**: #${u.nationalRank} ${u.rankingBody} | QS 2026: #${u.globalRankQS}
- **Annual Tuition**: ${u.tuitionAnnual.localAmount} (approx ${u.tuitionAnnual.inrEquivalent})
- **Median Package**: ${u.medianPackage.localAmount} (approx ${u.medianPackage.inrEquivalent})
${
  p
    ? `- **Placement Rate**: ${p.placementRate}% | Avg Salary: ${p.averageSalary}
- **Highest Package**: Domestic: ${p.highestPackage.domestic}${p.highestPackage.international ? ` | International: ${p.highestPackage.international}` : ""}
- **Top Recruiters**: ${p.topRecruiters.slice(0, 6).join(", ")}
- **Visa & Work Authorization**: ${p.workVisaSupport}`
    : ""
}
- **Admission Route**: ${u.admissionRoute}
- **Branch Cutoffs**:
${cutoffs || "  * Refer to official counseling matrix"}
- **Deadlines**:
${deadlines || "  * Check official portal"}
- **Key Advantages**: ${u.pros.slice(0, 2).join("; ")}
- **Considerations**: ${u.cons.slice(0, 2).join("; ")}
`;
  })
  .join("\n---\n")}
`);
  }

  // Recommended Institutional Fit Sets (for advisory queries)
  if (recommendedSets) {
    const renderList = (unis: University[]) =>
      unis
        .map(
          (u) =>
            `- ${COUNTRY_FLAGS[u.countryCode] || "🌐"} **${u.shortName}** (#${u.nationalRank} ${u.rankingBody}, QS #${u.globalRankQS}) | Tuition: ${u.tuitionAnnual.localAmount} | Median: ${u.medianPackage.localAmount}`
        )
        .join("\n");

    sections.push(`
### ALGORITHMIC FIT RECOMMENDATIONS:
**1. Reach Schools (Aspirational fit):**
${renderList(recommendedSets.reach) || "- None in current filter"}

**2. Target Choices (Solid match):**
${renderList(recommendedSets.target) || "- None in current filter"}

**3. Competitive Fit / Safe (High clearance probability):**
${renderList(recommendedSets.safe) || "- None in current filter"}
`);
  }

  return sections.join("\n\n");
}

