export type VaultDocType =
  | "CLASS_10"
  | "CLASS_12"
  | "EXAM_SCORECARD"
  | "ID_PROOF"
  | "MEDICAL_CERT"
  | "PASSPORT"
  | "APS_CERT"
  | "TRANSCRIPT"
  | "OTHER";

export interface VaultDocument {
  id: string;
  userEmail?: string; // Isolated owner email
  userId?: string; // Isolated user ID
  docType: VaultDocType;
  category?: string; // Canonical category e.g. "class_10", "class_12", "exam_scorecard"
  label: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  checksum: string; // SHA-256 hex string
  uploadedAt: string; // ISO format
}

export interface VaultDocumentMeta {
  id: string;
  userEmail?: string;
  userId?: string;
  docType: VaultDocType;
  category?: string;
  label: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  uploadedAt: string;
}

export type PreFlightStatus = "GREEN" | "AMBER" | "RED";

export interface AuditedRequirement {
  requiredName: string;
  status: "CLEARED" | "MISSING";
  matchedDoc?: {
    id: string;
    label: string;
    fileName: string;
    checksum: string;
    docType: VaultDocType;
  };
  isMandatory: boolean;
  category: "ACADEMIC" | "EXAM" | "IDENTITY" | "MEDICAL" | "VISA" | "GENERAL";
}

export interface PreFlightAuditResult {
  universityId: string;
  universityName: string;
  countryCode: string;
  totalRequired: number;
  clearedCount: number;
  missingCount: number;
  scorePercentage: number;
  status: PreFlightStatus;
  statusMessage: string;
  requirements: AuditedRequirement[];
}

