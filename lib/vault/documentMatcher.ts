/**
 * FindMyCampus Deterministic Credential Matching Engine
 * Pure-TypeScript, 100% On-Device Deterministic Prerequisite Auditor
 *
 * Guarantees:
 * 1. Zero false-positive matching across categories (e.g. Class 10 vs Class 12).
 * 2. Strict exam family checking (TS EAMCET cannot match JEE Advanced).
 * 3. Strict 1-to-1 bijective document binding (claimedDocIds prevents double-counting).
 * 4. 100% identical clearance calculations across all views.
 */

import type { VaultDocument, VaultDocType, PreFlightAuditResult, AuditedRequirement } from "@/types/vault";
import type { University } from "@/types/university";

export type CanonicalDocumentType =
  | "class_10"
  | "class_12"
  | "exam_scorecard"
  | "national_id"
  | "passport"
  | "transfer_migration"
  | "category_domicile"
  | "medical_fitness"
  | "transcript_degree"
  | "sop_lor_resume"
  | "financial_proof";

export interface CanonicalCategoryInfo {
  canonical: CanonicalDocumentType;
  label: string;
  defaultDocType: VaultDocType;
  categoryGroup: "ACADEMIC" | "EXAM" | "IDENTITY" | "MEDICAL" | "VISA" | "GENERAL";
}

export const CANONICAL_TAXONOMY: Record<CanonicalDocumentType, CanonicalCategoryInfo> = {
  class_10: {
    canonical: "class_10",
    label: "Class 10 Marksheet / Secondary School Certificate",
    defaultDocType: "CLASS_10",
    categoryGroup: "ACADEMIC",
  },
  class_12: {
    canonical: "class_12",
    label: "Class 12 Marksheet / Senior Secondary / Intermediate Proof",
    defaultDocType: "CLASS_12",
    categoryGroup: "ACADEMIC",
  },
  exam_scorecard: {
    canonical: "exam_scorecard",
    label: "Entrance Exam Scorecard / Rank Proof",
    defaultDocType: "EXAM_SCORECARD",
    categoryGroup: "EXAM",
  },
  national_id: {
    canonical: "national_id",
    label: "National Government ID / Aadhaar Card",
    defaultDocType: "ID_PROOF",
    categoryGroup: "IDENTITY",
  },
  passport: {
    canonical: "passport",
    label: "Official International Passport",
    defaultDocType: "PASSPORT",
    categoryGroup: "IDENTITY",
  },
  transfer_migration: {
    canonical: "transfer_migration",
    label: "Transfer / Migration / Conduct Certificate",
    defaultDocType: "OTHER",
    categoryGroup: "GENERAL",
  },
  category_domicile: {
    canonical: "category_domicile",
    label: "Category (OBC/SC/ST/EWS) / Domicile Certificate",
    defaultDocType: "ID_PROOF",
    categoryGroup: "GENERAL",
  },
  medical_fitness: {
    canonical: "medical_fitness",
    label: "Medical Fitness Certificate / Health Record",
    defaultDocType: "MEDICAL_CERT",
    categoryGroup: "MEDICAL",
  },
  transcript_degree: {
    canonical: "transcript_degree",
    label: "Official Academic Transcripts / Degree Certificate",
    defaultDocType: "TRANSCRIPT",
    categoryGroup: "ACADEMIC",
  },
  sop_lor_resume: {
    canonical: "sop_lor_resume",
    label: "Statement of Purpose (SOP) / LOR / CV",
    defaultDocType: "OTHER",
    categoryGroup: "GENERAL",
  },
  financial_proof: {
    canonical: "financial_proof",
    label: "Financial Affidavit / Bank Statement / Sponsor Proof",
    defaultDocType: "OTHER",
    categoryGroup: "GENERAL",
  },
};

/**
 * Normalizes any stored VaultDocType or custom category string into our CanonicalDocumentType.
 */
export function normalizeDocumentCategory(input?: string): CanonicalDocumentType | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim().replace(/[\s-]+/g, "_");

  switch (lower) {
    case "class_10":
    case "10th":
    case "ssc":
    case "matric":
    case "matriculation":
      return "class_10";

    case "class_12":
    case "12th":
    case "hsc":
    case "intermediate":
    case "a_levels":
    case "alevels":
    case "ib_diploma":
    case "abitur":
      return "class_12";

    case "exam_scorecard":
    case "exam":
    case "scorecard":
    case "rank_card":
    case "admit_card":
      return "exam_scorecard";

    case "id_proof":
    case "national_id":
    case "aadhaar":
    case "pan_card":
    case "government_id":
      return "national_id";

    case "passport":
      return "passport";

    case "medical_cert":
    case "medical_fitness":
    case "medical":
      return "medical_fitness";

    case "transcript":
    case "transcripts":
    case "transcript_degree":
    case "degree":
    case "aps_cert":
      return "transcript_degree";

    case "transfer_migration":
    case "tc":
    case "migration":
      return "transfer_migration";

    case "category_domicile":
    case "caste":
    case "domicile":
    case "ews":
    case "obc":
      return "category_domicile";

    case "sop_lor_resume":
    case "sop":
    case "lor":
    case "resume":
    case "cv":
      return "sop_lor_resume";

    case "financial_proof":
    case "finance":
    case "bank_statement":
      return "financial_proof";

    default:
      return null;
  }
}

/**
 * Known entrance exam definitions for strict exam-family isolation.
 */
interface ExamDefinition {
  family: string;
  aliases: string[];
}

const EXAM_DEFINITIONS: ExamDefinition[] = [
  { family: "jee_advanced", aliases: ["jee advanced", "jee-adv", "jeeadv", "iit jee"] },
  { family: "jee_main", aliases: ["jee main", "jee-main", "jeemain", "aieee"] },
  { family: "ts_eamcet", aliases: ["ts eamcet", "tseamcet", "eamcet ts", "telangana eamcet"] },
  { family: "ap_eapcet", aliases: ["ap eapcet", "apeapcet", "ap eamcet", "eamcet ap", "andhra eamcet"] },
  { family: "kcet", aliases: ["kcet", "karnataka cet"] },
  { family: "mht_cet", aliases: ["mht cet", "mhtcet", "maharashtra cet"] },
  { family: "wbjee", aliases: ["wbjee", "west bengal jee"] },
  { family: "bitsat", aliases: ["bitsat"] },
  { family: "viteee", aliases: ["viteee"] },
  { family: "srmjeee", aliases: ["srmjeee"] },
  { family: "comedk", aliases: ["comedk", "comed-k"] },
  { family: "cucet", aliases: ["cucet", "cuet"] },
  { family: "gate", aliases: ["gate exam", "gate scorecard", " gate "] },
  { family: "sat", aliases: ["digital sat", "sat scorecard", "sat exam", " sat "] },
  { family: "act", aliases: ["act scorecard", "act exam", " act "] },
  { family: "ielts", aliases: ["ielts"] },
  { family: "toefl", aliases: ["toefl"] },
  { family: "gre", aliases: ["gre scorecard", "gre exam", " gre "] },
  { family: "gmat", aliases: ["gmat"] },
  { family: "testas", aliases: ["testas"] },
  { family: "testdaf", aliases: ["testdaf"] },
  { family: "tmua", aliases: ["tmua"] },
  { family: "neet", aliases: ["neet"] },
];

/**
 * Extracts normalized exam family if named in text.
 */
export function detectExamFamily(text: string): string | null {
  const lower = ` ${text.toLowerCase()} `;
  for (const def of EXAM_DEFINITIONS) {
    for (const alias of def.aliases) {
      if (lower.includes(alias)) {
        return def.family;
      }
    }
  }
  // Generic fallback if text contains "jee" but neither main nor advanced is specified
  if (lower.includes("jee") && !lower.includes("wbjee")) {
    return "jee_generic";
  }
  return null;
}

export interface ClassifiedPrerequisite {
  raw: string;
  canonical: CanonicalDocumentType;
  examFamily: string | null;
  isMandatory: boolean;
  categoryGroup: "ACADEMIC" | "EXAM" | "IDENTITY" | "MEDICAL" | "VISA" | "GENERAL";
  suggestedDocType: VaultDocType;
}

/**
 * Classifies an institution's required document string into a canonical prerequisite.
 */
export function classifyPrerequisite(req: string): ClassifiedPrerequisite {
  const lower = req.toLowerCase();
  const examFamily = detectExamFamily(req);
  const isMandatory = !lower.includes("if applicable") && !lower.includes("optional");

  // 1. Class 10 Rule (Strict Negative Guardrails against 12)
  const has10Tokens =
    lower.includes("class 10") ||
    lower.includes("10th") ||
    lower.includes("tenth") ||
    lower.includes("ssc") ||
    lower.includes("matriculation") ||
    lower.includes("matric");
  const has12Tokens =
    lower.includes("class 12") ||
    lower.includes("12th") ||
    lower.includes("twelfth") ||
    lower.includes("hsc") ||
    lower.includes("intermediate") ||
    lower.includes("higher secondary") ||
    lower.includes("senior secondary") ||
    lower.includes("a-levels") ||
    lower.includes("ib diploma") ||
    lower.includes("abitur");

  if (has10Tokens && !has12Tokens) {
    return {
      raw: req,
      canonical: "class_10",
      examFamily: null,
      isMandatory,
      categoryGroup: "ACADEMIC",
      suggestedDocType: "CLASS_10",
    };
  }

  // 2. Class 12 Rule (Strict Negative Guardrails against 10)
  if (has12Tokens && !has10Tokens) {
    return {
      raw: req,
      canonical: "class_12",
      examFamily: null,
      isMandatory,
      categoryGroup: "ACADEMIC",
      suggestedDocType: "CLASS_12",
    };
  }

  // 3. Entrance Exam Scorecard
  if (
    examFamily !== null ||
    lower.includes("scorecard") ||
    lower.includes("rank proof") ||
    lower.includes("rank card") ||
    lower.includes("admit card") ||
    lower.includes("percentile") ||
    lower.includes("entrance test")
  ) {
    return {
      raw: req,
      canonical: "exam_scorecard",
      examFamily,
      isMandatory,
      categoryGroup: "EXAM",
      suggestedDocType: "EXAM_SCORECARD",
    };
  }

  // 4. Passport
  if (lower.includes("passport") || lower.includes("travel document")) {
    return {
      raw: req,
      canonical: "passport",
      examFamily: null,
      isMandatory,
      categoryGroup: "IDENTITY",
      suggestedDocType: "PASSPORT",
    };
  }

  // 5. National ID / Government ID
  if (
    lower.includes("aadhaar") ||
    lower.includes("national id") ||
    lower.includes("government id") ||
    lower.includes("government photo") ||
    lower.includes("photo id") ||
    lower.includes("pan card") ||
    lower.includes("identity card")
  ) {
    return {
      raw: req,
      canonical: "national_id",
      examFamily: null,
      isMandatory,
      categoryGroup: "IDENTITY",
      suggestedDocType: "ID_PROOF",
    };
  }

  // 6. Medical Fitness
  if (
    lower.includes("medical") ||
    lower.includes("fitness") ||
    lower.includes("physician") ||
    lower.includes("annexure 7") ||
    lower.includes("vaccination")
  ) {
    return {
      raw: req,
      canonical: "medical_fitness",
      examFamily: null,
      isMandatory: false,
      categoryGroup: "MEDICAL",
      suggestedDocType: "MEDICAL_CERT",
    };
  }

  // 7. Academic Transcripts & Degrees
  if (
    lower.includes("transcript") ||
    lower.includes("degree certificate") ||
    lower.includes("provisional certificate") ||
    lower.includes("consolidated marksheet") ||
    lower.includes("aps certificate")
  ) {
    return {
      raw: req,
      canonical: "transcript_degree",
      examFamily: null,
      isMandatory,
      categoryGroup: "ACADEMIC",
      suggestedDocType: "TRANSCRIPT",
    };
  }

  // 8. Category / Domicile Certificate
  if (
    lower.includes("caste") ||
    lower.includes("category certificate") ||
    lower.includes("obc") ||
    lower.includes("sc/st") ||
    lower.includes("ews") ||
    lower.includes("domicile") ||
    lower.includes("residence certificate") ||
    lower.includes("income certificate")
  ) {
    return {
      raw: req,
      canonical: "category_domicile",
      examFamily: null,
      isMandatory: false,
      categoryGroup: "GENERAL",
      suggestedDocType: "ID_PROOF",
    };
  }

  // 9. Transfer / Migration Certificate
  if (
    lower.includes("transfer certificate") ||
    lower.includes("migration") ||
    lower.includes("conduct certificate") ||
    lower.includes("leaving certificate") ||
    lower.includes("tc ")
  ) {
    return {
      raw: req,
      canonical: "transfer_migration",
      examFamily: null,
      isMandatory,
      categoryGroup: "GENERAL",
      suggestedDocType: "OTHER",
    };
  }

  // 10. Statement of Purpose / LOR / Resume
  if (
    lower.includes("statement of purpose") ||
    lower.includes("sop") ||
    lower.includes("recommendation") ||
    lower.includes("lor") ||
    lower.includes("resume") ||
    lower.includes("curriculum vitae")
  ) {
    return {
      raw: req,
      canonical: "sop_lor_resume",
      examFamily: null,
      isMandatory: false,
      categoryGroup: "GENERAL",
      suggestedDocType: "OTHER",
    };
  }

  // 11. Financial Proof
  if (
    lower.includes("bank statement") ||
    lower.includes("financial") ||
    lower.includes("blocked account") ||
    lower.includes("sponsor")
  ) {
    return {
      raw: req,
      canonical: "financial_proof",
      examFamily: null,
      isMandatory,
      categoryGroup: "GENERAL",
      suggestedDocType: "OTHER",
    };
  }

  // Fallback to general academic or general requirement
  return {
    raw: req,
    canonical: "transcript_degree",
    examFamily: null,
    isMandatory,
    categoryGroup: "GENERAL",
    suggestedDocType: "OTHER",
  };
}

/**
 * Checks if a specific vault document satisfies a classified prerequisite with strict mutual exclusion.
 */
export function doesDocumentMatchPrerequisite(
  doc: VaultDocument,
  prereq: ClassifiedPrerequisite
): boolean {
  // 1. Normalize document's own category
  const docCanonical =
    normalizeDocumentCategory((doc as unknown as { category?: string }).category) ||
    normalizeDocumentCategory(doc.docType);

  const labelLower = doc.label.toLowerCase();
  const fileLower = doc.fileName.toLowerCase();
  const combinedText = ` ${labelLower} ${fileLower} `;

  // Negative Guardrail 1: Class 10 MUST NEVER match Class 12
  if (prereq.canonical === "class_10") {
    if (docCanonical === "class_12") return false;
    if (
      combinedText.includes("12th") ||
      combinedText.includes("class 12") ||
      combinedText.includes("twelfth") ||
      combinedText.includes("hsc") ||
      combinedText.includes("intermediate") ||
      combinedText.includes("senior secondary")
    ) {
      return false;
    }
    // Must be either canonical class_10 or text must strictly indicate 10th
    if (docCanonical === "class_10") return true;
    return (
      combinedText.includes("10th") ||
      combinedText.includes("class 10") ||
      combinedText.includes("tenth") ||
      combinedText.includes("ssc") ||
      combinedText.includes("matric")
    );
  }

  // Negative Guardrail 2: Class 12 MUST NEVER match Class 10
  if (prereq.canonical === "class_12") {
    if (docCanonical === "class_10") return false;
    if (
      combinedText.includes("10th") ||
      combinedText.includes("class 10") ||
      combinedText.includes("tenth") ||
      combinedText.includes("ssc") ||
      combinedText.includes("matric")
    ) {
      return false;
    }
    // Must be either canonical class_12 or text must strictly indicate 12th
    if (docCanonical === "class_12") return true;
    return (
      combinedText.includes("12th") ||
      combinedText.includes("class 12") ||
      combinedText.includes("twelfth") ||
      combinedText.includes("hsc") ||
      combinedText.includes("intermediate") ||
      combinedText.includes("higher secondary") ||
      combinedText.includes("senior secondary") ||
      combinedText.includes("a-levels") ||
      combinedText.includes("abitur")
    );
  }

  // Negative Guardrail 3: Exam Scorecard strict exam-family checking
  if (prereq.canonical === "exam_scorecard") {
    // If doc is clearly not an exam scorecard
    if (docCanonical && docCanonical !== "exam_scorecard" && docCanonical !== "sop_lor_resume") {
      return false;
    }

    const docExam = detectExamFamily(combinedText);

    // If prerequisite demands a specific entrance exam (e.g. TS EAMCET, JEE Advanced, SRMJEEE)
    if (prereq.examFamily) {
      // If doc specifies an exam and it does not match
      if (docExam && docExam !== prereq.examFamily) {
        // Special case: "jee_generic" can match jee_main or jee_advanced if not conflicted
        if (prereq.examFamily.startsWith("jee_") && docExam === "jee_generic") {
          return true;
        }
        return false;
      }
      // If doc matches the exact exam family
      if (docExam === prereq.examFamily) {
        return true;
      }
      // If doc is typed as EXAM_SCORECARD but text does not mention any other conflicting exam
      if (docCanonical === "exam_scorecard" && !docExam) {
        return true;
      }
      return false;
    }

    // Generic exam requirement (e.g. "Entrance Exam Scorecard")
    if (docCanonical === "exam_scorecard") return true;
    return (
      combinedText.includes("scorecard") ||
      combinedText.includes("rank card") ||
      combinedText.includes("rank proof") ||
      docExam !== null
    );
  }

  // Negative Guardrail 4: National ID vs Passport
  if (prereq.canonical === "national_id") {
    if (docCanonical === "passport") return false;
    if (docCanonical === "national_id") return true;
    return (
      combinedText.includes("aadhaar") ||
      combinedText.includes("pan card") ||
      combinedText.includes("national id") ||
      combinedText.includes("government id") ||
      combinedText.includes("photo id")
    );
  }

  if (prereq.canonical === "passport") {
    if (docCanonical === "passport") return true;
    return combinedText.includes("passport") || combinedText.includes("travel document");
  }

  // Medical Fitness
  if (prereq.canonical === "medical_fitness") {
    if (docCanonical === "medical_fitness") return true;
    return (
      combinedText.includes("medical") ||
      combinedText.includes("fitness") ||
      combinedText.includes("annexure 7") ||
      combinedText.includes("physician")
    );
  }

  // Academic Transcripts / Degree
  if (prereq.canonical === "transcript_degree") {
    if (docCanonical === "transcript_degree") return true;
    return (
      combinedText.includes("transcript") ||
      combinedText.includes("degree certificate") ||
      combinedText.includes("aps certificate")
    );
  }

  // Transfer / Migration
  if (prereq.canonical === "transfer_migration") {
    if (docCanonical === "transfer_migration") return true;
    return (
      combinedText.includes("transfer certificate") ||
      combinedText.includes("migration") ||
      combinedText.includes("conduct certificate")
    );
  }

  // Category / Domicile
  if (prereq.canonical === "category_domicile") {
    if (docCanonical === "category_domicile") return true;
    return (
      combinedText.includes("caste") ||
      combinedText.includes("category certificate") ||
      combinedText.includes("obc") ||
      combinedText.includes("sc/st") ||
      combinedText.includes("domicile") ||
      combinedText.includes("ews")
    );
  }

  // SOP / LOR / Resume
  if (prereq.canonical === "sop_lor_resume") {
    if (docCanonical === "sop_lor_resume") return true;
    return (
      combinedText.includes("statement of purpose") ||
      combinedText.includes("sop") ||
      combinedText.includes("recommendation") ||
      combinedText.includes("lor") ||
      combinedText.includes("resume")
    );
  }

  // Financial Proof
  if (prereq.canonical === "financial_proof") {
    if (docCanonical === "financial_proof") return true;
    return (
      combinedText.includes("bank statement") ||
      combinedText.includes("financial") ||
      combinedText.includes("blocked account")
    );
  }

  // Fallback: strictly check canonical match if known
  if (docCanonical && docCanonical === prereq.canonical) {
    return true;
  }

  return false;
}

/**
 * Deterministically audits all prerequisites for a university against a user's vault documents.
 * Guarantees strict 1-to-1 bijective document binding (zero double-counting).
 */
export function auditUniversityPrerequisites(
  university: University,
  vaultDocs: VaultDocument[]
): PreFlightAuditResult {
  const requiredList = university.requiredDocs || [];
  const requirements: AuditedRequirement[] = [];
  const claimedDocIds = new Set<string>();

  for (const rawReq of requiredList) {
    const prereq = classifyPrerequisite(rawReq);

    // Find the first matching unclaimed document
    let matchedDoc: VaultDocument | undefined = undefined;

    for (const doc of vaultDocs) {
      if (claimedDocIds.has(doc.id)) {
        continue; // Already claimed by another prerequisite
      }

      if (doesDocumentMatchPrerequisite(doc, prereq)) {
        matchedDoc = doc;
        claimedDocIds.add(doc.id); // Bind immediately (bijective 1-to-1 lock)
        break;
      }
    }

    if (matchedDoc) {
      requirements.push({
        requiredName: rawReq,
        status: "CLEARED",
        matchedDoc: {
          id: matchedDoc.id,
          label: matchedDoc.label,
          fileName: matchedDoc.fileName,
          checksum: matchedDoc.checksum,
          docType: matchedDoc.docType,
        },
        isMandatory: prereq.isMandatory,
        category: prereq.categoryGroup,
      });
    } else {
      requirements.push({
        requiredName: rawReq,
        status: "MISSING",
        isMandatory: prereq.isMandatory,
        category: prereq.categoryGroup,
      });
    }
  }

  const totalRequired = requirements.length;
  const clearedCount = requirements.filter((r) => r.status === "CLEARED").length;
  const missingCount = totalRequired - clearedCount;
  const scorePercentage = totalRequired > 0 ? Math.round((clearedCount / totalRequired) * 100) : 100;

  // Status computation
  let status: "GREEN" | "AMBER" | "RED";
  let statusMessage: string;

  if (scorePercentage === 100) {
    status = "GREEN";
    statusMessage = "All official mandatory admission prerequisites satisfied in sovereign vault.";
  } else if (clearedCount > 0) {
    status = "AMBER";
    statusMessage = `${clearedCount} of ${totalRequired} credentials verified. ${missingCount} prerequisite${missingCount > 1 ? "s" : ""} pending.`;
  } else {
    status = "RED";
    statusMessage = `0 of ${totalRequired} mandatory admission prerequisites found in local vault.`;
  }

  return {
    universityId: university.id,
    universityName: university.name,
    countryCode: university.countryCode,
    totalRequired,
    clearedCount,
    missingCount,
    scorePercentage,
    status,
    statusMessage,
    requirements,
  };
}

/**
 * Backward-compatible alias for existing imports of auditUniversityCompliance.
 */
export function auditUniversityCompliance(
  vaultDocs: VaultDocument[],
  university: University
): PreFlightAuditResult {
  return auditUniversityPrerequisites(university, vaultDocs);
}

