/**
 * FindMyCampus Deterministic Pre-Flight Clearance Engine
 * 100% On-Device Automated Compliance Auditor
 * Delegates to documentMatcher.ts as the single source of truth.
 */

import type { VaultDocument, PreFlightAuditResult } from "@/types/vault";
import type { University } from "@/types/university";
import {
  auditUniversityPrerequisites,
  auditUniversityCompliance as matcherAudit,
  classifyPrerequisite,
  doesDocumentMatchPrerequisite,
  normalizeDocumentCategory,
  detectExamFamily,
  CANONICAL_TAXONOMY,
  type CanonicalDocumentType,
  type ClassifiedPrerequisite,
} from "./documentMatcher";

export {
  auditUniversityPrerequisites,
  classifyPrerequisite,
  doesDocumentMatchPrerequisite,
  normalizeDocumentCategory,
  detectExamFamily,
  CANONICAL_TAXONOMY,
  type CanonicalDocumentType,
  type ClassifiedPrerequisite,
};

/**
 * Runs a deterministic compliance audit of the user's sovereign vault
 * against any selected target university.
 */
export function auditUniversityCompliance(
  vaultDocs: VaultDocument[],
  university: University
): PreFlightAuditResult {
  return matcherAudit(vaultDocs, university);
}
