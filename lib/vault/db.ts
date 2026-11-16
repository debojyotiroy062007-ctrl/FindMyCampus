/**
 * FindMyCampus Sovereign IndexedDB Persistence Layer
 * Local Binary Blob Storage for AES-GCM Encrypted Payloads
 * Zero Remote Transmission · Zero External Analytics
 */

import type { VaultDocument, VaultDocType } from "@/types/vault";
import { encryptDocument, decryptDocument } from "./crypto";

const DB_NAME = "FindMyCampus_SovereignVault";
const DB_VERSION = 1;
const STORE_NAME = "documents";

/**
 * Retrieves the active candidate email from localStorage to scope on-device vault records.
 */
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("findmycampus_auth_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user.email || user.id || null;
  } catch {
    return null;
  }
}

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("docType", "docType", { unique: false });
        store.createIndex("uploadedAt", "uploadedAt", { unique: false });
        store.createIndex("userEmail", "userEmail", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a new encrypted document into IndexedDB, scoped to the active candidate.
 */
export async function saveEncryptedDoc(doc: VaultDocument, userEmail?: string): Promise<void> {
  const owner = userEmail || doc.userEmail || getCurrentUserEmail() || undefined;
  if (owner && !doc.userEmail) {
    doc.userEmail = owner;
  }
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(doc);

    request.onsuccess = () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("findmycampus_vault_updated"));
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all stored vault documents scoped to the active candidate.
 */
export async function getAllVaultDocs(userEmail?: string): Promise<VaultDocument[]> {
  const currentUser = userEmail !== undefined ? userEmail : getCurrentUserEmail();
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      let results = (request.result as VaultDocument[]) || [];
      if (currentUser) {
        // Return only documents belonging to this active candidate profile
        results = results.filter((d) => d.userEmail === currentUser);
      } else {
        // Unauthenticated guests have 0 active vault docs
        results = [];
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a single encrypted document record by ID.
 */
export async function getVaultDoc(id: string): Promise<VaultDocument | undefined> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as VaultDocument | undefined);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Decrypts a document on-the-fly and returns the plaintext buffer with metadata.
 */
export async function getDecryptedDoc(id: string): Promise<{
  buffer: ArrayBuffer;
  mimeType: string;
  fileName: string;
  label: string;
  checksum: string;
}> {
  const doc = await getVaultDoc(id);
  if (!doc) {
    throw new Error(`Vault document with ID ${id} not found.`);
  }

  const decryptedBuffer = await decryptDocument(doc.encryptedData, doc.iv);
  return {
    buffer: decryptedBuffer,
    mimeType: doc.mimeType,
    fileName: doc.fileName,
    label: doc.label,
    checksum: doc.checksum,
  };
}

/**
 * Deletes a single document by ID from IndexedDB.
 */
export async function deleteVaultDoc(id: string): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("findmycampus_vault_updated"));
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Purges all records from the vault for the active candidate.
 */
export async function purgeAllVaultDocs(userEmail?: string): Promise<void> {
  const currentUser = userEmail !== undefined ? userEmail : getCurrentUserEmail();
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    if (!currentUser) {
      const request = store.clear();
      request.onsuccess = () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("findmycampus_vault_updated"));
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    } else {
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const allDocs = (getAllReq.result as VaultDocument[]) || [];
        const toDelete = allDocs.filter((d) => d.userEmail === currentUser);
        for (const doc of toDelete) {
          store.delete(doc.id);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("findmycampus_vault_updated"));
        }
        resolve();
      };
      getAllReq.onerror = () => reject(getAllReq.error);
    }
  });
}

/**
 * Calculates current total storage usage in bytes for the active candidate.
 */
export async function getVaultStorageUsage(userEmail?: string): Promise<number> {
  const docs = await getAllVaultDocs(userEmail);
  return docs.reduce((acc, d) => acc + (d.fileSize || d.encryptedData.byteLength || 0), 0);
}

// Helpers for buffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Exports all encrypted documents into an encrypted backup JSON string (.vault).
 */
export async function exportVaultBackup(userEmail?: string): Promise<string> {
  const docs = await getAllVaultDocs(userEmail);
  const serializableDocs = docs.map((d) => ({
    ...d,
    encryptedData: arrayBufferToBase64(d.encryptedData),
    iv: Array.from(d.iv),
  }));

  const backupPackage = {
    app: "FindMyCampus",
    version: "3.0.0",
    owner: userEmail || getCurrentUserEmail() || "anonymous",
    exportedAt: new Date().toISOString(),
    cryptoStandard: "AES-GCM-256",
    documentCount: docs.length,
    documents: serializableDocs,
  };

  return JSON.stringify(backupPackage, null, 2);
}

/**
 * Imports an encrypted vault backup JSON package into local IndexedDB.
 */
export async function importVaultBackup(jsonStr: string, userEmail?: string): Promise<number> {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.documents || !Array.isArray(parsed.documents)) {
    throw new Error("Invalid .vault backup package format.");
  }

  const owner = userEmail || getCurrentUserEmail() || undefined;

  let count = 0;
  for (const item of parsed.documents) {
    const doc: VaultDocument = {
      id: item.id || crypto.randomUUID(),
      userEmail: owner || item.userEmail,
      docType: item.docType as VaultDocType,
      category: item.category,
      label: item.label,
      fileName: item.fileName,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      encryptedData: base64ToArrayBuffer(item.encryptedData),
      iv: new Uint8Array(item.iv),
      checksum: item.checksum,
      uploadedAt: item.uploadedAt || new Date().toISOString(),
    };
    await saveEncryptedDoc(doc, owner);
    count++;
  }

  return count;
}

/**
 * Generates and stores genuine AES-GCM-256 encrypted sample credentials
 * so users can immediately test pre-flight compliance audits with a single click.
 */
export async function seedDemoCredentials(userEmail?: string): Promise<void> {
  const targetEmail = userEmail || getCurrentUserEmail() || "candidate@findmycampus.local";
  const demoFiles: {
    docType: VaultDocType;
    label: string;
    fileName: string;
    mimeType: string;
    textContent: string;
  }[] = [
      {
        docType: "CLASS_10",
        label: "Class 10 Board Passing Certificate (CBSE)",
        fileName: "CBSE_Class10_Passing_Certificate.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (CBSE Class 10 Certificate - Roll 1149204) >> endobj",
      },
      {
        docType: "CLASS_12",
        label: "Class 12 Marksheet & Passing Proof (CBSE)",
        fileName: "CBSE_Class12_Marksheet_96.4Pct.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (CBSE Class 12 Senior Certificate - Aggregate 96.4%) >> endobj",
      },
      {
        docType: "EXAM_SCORECARD",
        label: "JEE Advanced 2025 Rank Card (AIR 450)",
        fileName: "JEE_Advanced_Scorecard_AIR450.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (JEE Advanced All India Rank 450 - CRL Qualified) >> endobj",
      },
      {
        docType: "PASSPORT",
        label: "Republic of India Official Passport",
        fileName: "Passport_Official_Identity_Proof.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (Passport Govt of India - Valid Until 2034) >> endobj",
      },
      {
        docType: "MEDICAL_CERT",
        label: "JoSAA Medical Fitness Certificate (Registered Physician)",
        fileName: "JoSAA_Annexure7_MedicalFitness.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (Medical Fitness Certificate - Annexure VII Certified) >> endobj",
      },
      {
        docType: "ID_PROOF",
        label: "Aadhaar Card (UIDAI Verified)",
        fileName: "Aadhaar_Government_ID_Verified.pdf",
        mimeType: "application/pdf",
        textContent: "%PDF-1.4\n1 0 obj << /Title (UIDAI Masked Aadhaar Verification Slip) >> endobj",
      },
    ];

  const encoder = new TextEncoder();

  for (const item of demoFiles) {
    const buffer = encoder.encode(item.textContent).buffer;
    const { ciphertext, iv, checksum } = await encryptDocument(buffer);

    const doc: VaultDocument = {
      id: crypto.randomUUID(),
      userEmail: targetEmail,
      docType: item.docType,
      category: item.docType.toLowerCase(),
      label: item.label,
      fileName: item.fileName,
      fileSize: buffer.byteLength,
      mimeType: item.mimeType,
      encryptedData: ciphertext,
      iv,
      checksum,
      uploadedAt: new Date().toISOString(),
    };

    await saveEncryptedDoc(doc, targetEmail);
  }
}

