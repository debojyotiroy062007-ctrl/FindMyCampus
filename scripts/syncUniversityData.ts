import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { UNIVERSITIES } from "../lib/data/universities";
import { universitiesIndia } from "../lib/data/universitiesIndia";
import { universitiesUS } from "../lib/data/universitiesUS";
import { universitiesUK } from "../lib/data/universitiesUK";
import { universitiesCanada } from "../lib/data/universitiesCanada";
import { universitiesGermany } from "../lib/data/universitiesGermany";
import { universitiesAustralia } from "../lib/data/universitiesAustralia";
import { universitiesOther } from "../lib/data/universitiesOther";
import type { University } from "../types/university";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

export interface GuardrailDecision {
  institutionId: string;
  institutionName: string;
  field: string;
  oldValue: string;
  newValue: string;
  verdict: "ACCEPTED" | "REJECTED";
  reason?: string;
}

/**
 * Extracts a numeric value from tuition string representation.
 * Supports "2.25 Lakh/yr", "$61,950/yr", "€0 (Public tuition-free)", etc.
 */
function extractNumericTuition(amountStr: string | undefined | null): number | null {
  if (!amountStr) return null;
  const lakhMatch = amountStr.match(/([\d.]+)\s*Lakh/i);
  if (lakhMatch) return parseFloat(lakhMatch[1]);
  const clean = amountStr.replace(/,/g, "");
  const numMatch = clean.match(/([\d.]+)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return null;
}

/**
 * Validates a proposed update against strict deterministic guardrails.
 */
export function validateUpdate(
  current: University,
  update: Partial<University>
): {
  validated: Partial<University>;
  decisions: GuardrailDecision[];
} {
  const validated: Partial<University> = {};
  const decisions: GuardrailDecision[] = [];

  // 1. QS Rank / Global Rank
  const candidateQS = update.globalRankQS ?? update.qsRank;
  if (candidateQS !== undefined && candidateQS !== null) {
    if (typeof candidateQS !== "number" || isNaN(candidateQS) || candidateQS <= 0) {
      decisions.push({
        institutionId: current.id,
        institutionName: current.name,
        field: "globalRankQS",
        oldValue: String(current.globalRankQS),
        newValue: String(candidateQS),
        verdict: "REJECTED",
        reason: "Rank must be a positive integer",
      });
    } else {
      const oldRank = current.globalRankQS;
      const jump = oldRank > 0 ? Math.abs(candidateQS - oldRank) / oldRank : 0;
      if (jump > 0.4) {
        console.warn(
          `[Guardrail Alert] Single-month jump > 40% for ${current.id}. Retaining previous verified value. (QS Rank: ${oldRank} -> ${candidateQS}, jump: ${(jump * 100).toFixed(1)}%)`
        );
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "globalRankQS",
          oldValue: String(oldRank),
          newValue: String(candidateQS),
          verdict: "REJECTED",
          reason: `Outlier rank jump > 40% (${(jump * 100).toFixed(1)}%)`,
        });
      } else {
        validated.globalRankQS = candidateQS;
        validated.qsRank = candidateQS;
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "globalRankQS",
          oldValue: String(oldRank),
          newValue: String(candidateQS),
          verdict: "ACCEPTED",
        });
      }
    }
  }

  // 2. National Rank
  if (update.nationalRank !== undefined && update.nationalRank !== null) {
    if (typeof update.nationalRank !== "number" || isNaN(update.nationalRank) || update.nationalRank <= 0) {
      decisions.push({
        institutionId: current.id,
        institutionName: current.name,
        field: "nationalRank",
        oldValue: String(current.nationalRank),
        newValue: String(update.nationalRank),
        verdict: "REJECTED",
        reason: "National rank must be a positive integer",
      });
    } else {
      const oldRank = current.nationalRank;
      const jump = oldRank > 0 ? Math.abs(update.nationalRank - oldRank) / oldRank : 0;
      if (jump > 0.4) {
        console.warn(
          `[Guardrail Alert] Single-month jump > 40% for ${current.id}. Retaining previous verified value. (National Rank: ${oldRank} -> ${update.nationalRank}, jump: ${(jump * 100).toFixed(1)}%)`
        );
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "nationalRank",
          oldValue: String(oldRank),
          newValue: String(update.nationalRank),
          verdict: "REJECTED",
          reason: `Outlier national rank jump > 40% (${(jump * 100).toFixed(1)}%)`,
        });
      } else {
        validated.nationalRank = update.nationalRank;
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "nationalRank",
          oldValue: String(oldRank),
          newValue: String(update.nationalRank),
          verdict: "ACCEPTED",
        });
      }
    }
  }

  // 3. Ranking Body
  if (typeof update.rankingBody === "string" && update.rankingBody.trim()) {
    validated.rankingBody = update.rankingBody.trim();
    decisions.push({
      institutionId: current.id,
      institutionName: current.name,
      field: "rankingBody",
      oldValue: current.rankingBody,
      newValue: update.rankingBody.trim(),
      verdict: "ACCEPTED",
    });
  }

  // 4. Acceptance Rate
  if (typeof update.acceptanceRate === "string" && update.acceptanceRate.trim()) {
    const rawRate = update.acceptanceRate.trim();
    // Normalize ~ or approx
    const normalizedRate = rawRate.replace(/^[~≈\s]+/, "").trim();
    const rateRegex = /^\d+(\.\d+)?%$/;

    if (!rateRegex.test(normalizedRate)) {
      decisions.push({
        institutionId: current.id,
        institutionName: current.name,
        field: "acceptanceRate",
        oldValue: current.acceptanceRate,
        newValue: rawRate,
        verdict: "REJECTED",
        reason: "Acceptance rate must be an exact decimal percentage ending with % (no ~)",
      });
    } else {
      const oldPct = parseFloat(current.acceptanceRate.replace("%", ""));
      const newPct = parseFloat(normalizedRate.replace("%", ""));
      const jump = !isNaN(oldPct) && oldPct > 0 ? Math.abs(newPct - oldPct) / oldPct : 0;

      if (jump > 0.4) {
        console.warn(
          `[Guardrail Alert] Single-month jump > 40% for ${current.id}. Retaining previous verified value. (Acceptance Rate: ${current.acceptanceRate} -> ${normalizedRate}, jump: ${(jump * 100).toFixed(1)}%)`
        );
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "acceptanceRate",
          oldValue: current.acceptanceRate,
          newValue: normalizedRate,
          verdict: "REJECTED",
          reason: `Outlier acceptance rate jump > 40% (${(jump * 100).toFixed(1)}%)`,
        });
      } else {
        validated.acceptanceRate = normalizedRate;
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "acceptanceRate",
          oldValue: current.acceptanceRate,
          newValue: normalizedRate,
          verdict: "ACCEPTED",
        });
      }
    }
  }

  // 5. Annual Tuition
  if (update.tuitionAnnual || update.annualTuition) {
    const candidateAnnual = update.tuitionAnnual?.localAmount || update.annualTuition;
    const isGerman = current.countryCode === "DE";

    if (!candidateAnnual || candidateAnnual === "null" || candidateAnnual === "undefined") {
      decisions.push({
        institutionId: current.id,
        institutionName: current.name,
        field: "annualTuition",
        oldValue: current.tuitionAnnual?.localAmount || current.annualTuition || "N/A",
        newValue: String(candidateAnnual),
        verdict: "REJECTED",
        reason: "Tuition cannot be null or undefined",
      });
    } else {
      const oldNum = extractNumericTuition(current.tuitionAnnual?.localAmount || current.annualTuition);
      const newNum = extractNumericTuition(candidateAnnual);

      // Check if 0 tuition on non-German institution
      if ((newNum === 0 || candidateAnnual === "0") && !isGerman) {
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "annualTuition",
          oldValue: current.tuitionAnnual?.localAmount || current.annualTuition || "N/A",
          newValue: candidateAnnual,
          verdict: "REJECTED",
          reason: "Zero tuition is only permitted for verified public German universities",
        });
      } else if (oldNum !== null && newNum !== null && oldNum > 0) {
        const jump = Math.abs(newNum - oldNum) / oldNum;
        if (jump > 0.4) {
          console.warn(
            `[Guardrail Alert] Single-month jump > 40% for ${current.id}. Retaining previous verified value. (Tuition: ${oldNum} -> ${newNum}, jump: ${(jump * 100).toFixed(1)}%)`
          );
          decisions.push({
            institutionId: current.id,
            institutionName: current.name,
            field: "annualTuition",
            oldValue: current.tuitionAnnual?.localAmount || current.annualTuition || "N/A",
            newValue: candidateAnnual,
            verdict: "REJECTED",
            reason: `Outlier tuition jump > 40% (${(jump * 100).toFixed(1)}%)`,
          });
        } else {
          // Accepted tuition update
          if (update.tuitionAnnual) {
            validated.tuitionAnnual = {
              localCurrency: update.tuitionAnnual.localCurrency || current.tuitionAnnual?.localCurrency || "$",
              localAmount: update.tuitionAnnual.localAmount,
              inrEquivalent: update.tuitionAnnual.inrEquivalent || current.tuitionAnnual?.inrEquivalent || "",
            };
            validated.annualTuition = update.tuitionAnnual.localAmount;
          } else if (update.annualTuition) {
            validated.annualTuition = update.annualTuition;
            if (validated.tuitionAnnual) {
              validated.tuitionAnnual.localAmount = update.annualTuition;
            }
          }

          decisions.push({
            institutionId: current.id,
            institutionName: current.name,
            field: "annualTuition",
            oldValue: current.tuitionAnnual?.localAmount || current.annualTuition || "N/A",
            newValue: candidateAnnual,
            verdict: "ACCEPTED",
          });
        }
      } else {
        // German €0 or new baseline
        if (update.tuitionAnnual) {
          validated.tuitionAnnual = update.tuitionAnnual;
          validated.annualTuition = update.tuitionAnnual.localAmount;
        } else if (update.annualTuition) {
          validated.annualTuition = update.annualTuition;
        }
        decisions.push({
          institutionId: current.id,
          institutionName: current.name,
          field: "annualTuition",
          oldValue: current.tuitionAnnual?.localAmount || current.annualTuition || "N/A",
          newValue: candidateAnnual,
          verdict: "ACCEPTED",
        });
      }
    }
  }

  // 6. Cutoff Score
  if (typeof update.cutoffScore === "string" && update.cutoffScore.trim()) {
    const trimmed = update.cutoffScore.trim();
    validated.cutoffScore = trimmed;
    decisions.push({
      institutionId: current.id,
      institutionName: current.name,
      field: "cutoffScore",
      oldValue: current.cutoffScore || "None",
      newValue: trimmed,
      verdict: "ACCEPTED",
    });
  }

  return { validated, decisions };
}

/**
 * Renders a crisp ASCII table for verification diffs.
 */
function renderDiffTable(decisions: GuardrailDecision[]) {
  if (decisions.length === 0) {
    console.log("No field diffs recorded.");
    return;
  }

  const truncate = (str: string, len: number) => {
    if (!str) return "".padEnd(len);
    return str.length > len ? str.slice(0, len - 1) + "…" : str.padEnd(len);
  };

  const colWidths = {
    institution: 34,
    field: 16,
    oldValue: 18,
    newValue: 18,
    verdict: 10,
  };

  const border = {
    top: `┌${"─".repeat(colWidths.institution + 2)}┬${"─".repeat(colWidths.field + 2)}┬${"─".repeat(colWidths.oldValue + 2)}┬${"─".repeat(colWidths.newValue + 2)}┬${"─".repeat(colWidths.verdict + 2)}┐`,
    headerMid: `├${"─".repeat(colWidths.institution + 2)}┼${"─".repeat(colWidths.field + 2)}┼${"─".repeat(colWidths.oldValue + 2)}┼${"─".repeat(colWidths.newValue + 2)}┼${"─".repeat(colWidths.verdict + 2)}┤`,
    bottom: `└${"─".repeat(colWidths.institution + 2)}┴${"─".repeat(colWidths.field + 2)}┴${"─".repeat(colWidths.oldValue + 2)}┴${"─".repeat(colWidths.newValue + 2)}┴${"─".repeat(colWidths.verdict + 2)}┘`,
  };

  console.log(border.top);
  console.log(
    `│ ${truncate("Institution", colWidths.institution)} │ ${truncate("Field", colWidths.field)} │ ${truncate("Old Value", colWidths.oldValue)} │ ${truncate("New Value", colWidths.newValue)} │ ${truncate("Verdict", colWidths.verdict)} │`
  );
  console.log(border.headerMid);

  for (const d of decisions) {
    const verdictColor = d.verdict === "ACCEPTED" ? "\x1b[32mACCEPTED\x1b[0m" : "\x1b[31mREJECTED\x1b[0m";
    const rawVerdict = d.verdict;
    console.log(
      `│ ${truncate(d.institutionName, colWidths.institution)} │ ${truncate(d.field, colWidths.field)} │ ${truncate(d.oldValue, colWidths.oldValue)} │ ${truncate(d.newValue, colWidths.newValue)} │ ${truncate(rawVerdict, colWidths.verdict)} │`
    );
  }

  console.log(border.bottom);
}

/**
 * Main execution handler.
 */
async function main() {
  const isDryRun = process.argv.includes("--dry-run") || process.argv.includes("-d");
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  console.log("============================================================");
  console.log(" FINDMYCAMPUS AUTONOMOUS MONTHLY DATA VERIFICATION PIPELINE");
  console.log("============================================================");
  console.log(`Execution Mode : ${isDryRun ? "DRY-RUN (No files modified)" : "PRODUCTION (Live sync & commit)"}`);
  console.log(`Total Dataset  : ${UNIVERSITIES.length} institutions loaded`);
  console.log(`Target Model   : ${modelName}`);

  // Validation of initial array counts
  const initialCounts = {
    IN: universitiesIndia.length,
    US: universitiesUS.length,
    UK: universitiesUK.length,
    CA: universitiesCanada.length,
    DE: universitiesGermany.length,
    AU: universitiesAustralia.length,
    Other: universitiesOther.length,
    total: UNIVERSITIES.length,
  };

  console.log(`Partition Distribution: IN=${initialCounts.IN}, US=${initialCounts.US}, UK=${initialCounts.UK}, CA=${initialCounts.CA}, DE=${initialCounts.DE}, AU=${initialCounts.AU}, Other=${initialCounts.Other}\n`);

  if (isDryRun) {
    console.log("[Dry-Run] Verifying first 5 universities from dataset...\n");
    const testUniversities = UNIVERSITIES.slice(0, 5);
    const allDecisions: GuardrailDecision[] = [];

    const runDeterministicSimulation = () => {
      console.log("[Data Sync Engine] Executing deterministic schema & guardrail validation against live dataset...");

      // Simulate verification checks on the 5 institutions including edge cases and guardrail alerts
      const testCases: Array<{ univ: University; candidateUpdate: Partial<University> }> = [
        {
          univ: testUniversities[0],
          // Acceptance rate confirmed & standardized
          candidateUpdate: {
            acceptanceRate: testUniversities[0].acceptanceRate,
            rankingBody: "NIRF 2025",
          },
        },
        {
          univ: testUniversities[1],
          // Minor QS rank adjustment (within 40%)
          candidateUpdate: {
            globalRankQS: Math.max(1, testUniversities[1].globalRankQS - 2),
            cutoffScore: testUniversities[1].cutoffScore,
          },
        },
        {
          univ: testUniversities[2],
          // Cutoff benchmark confirmation
          candidateUpdate: {
            cutoffScore: testUniversities[2].cutoffScore || "AIR ≤ 68",
          },
        },
        {
          univ: testUniversities[3],
          // Simulated outlier rank jump > 40% (MUST BE REJECTED)
          candidateUpdate: {
            globalRankQS: Math.round(testUniversities[3].globalRankQS * 1.65),
          },
        },
        {
          univ: testUniversities[4],
          // Simulated zero tuition on non-German institution (MUST BE REJECTED)
          candidateUpdate: {
            annualTuition: "0",
          },
        },
      ];

      for (const { univ, candidateUpdate } of testCases) {
        const { decisions } = validateUpdate(univ, candidateUpdate);
        allDecisions.push(...decisions);
      }
    };

    if (!apiKey) {
      console.log("[Data Sync Engine] GEMINI_API_KEY is not set.");
      runDeterministicSimulation();
    } else {
      // Live Gemini API Dry-Run with Google Search
      let networkErrorEncountered = false;
      const ai = new GoogleGenAI({ apiKey });
      for (const univ of testUniversities) {
        console.log(`[Google Search Grounding] Verifying ${univ.name} (${univ.countryName})...`);
        try {
          const prompt = `You are FindMyCampus admissions verification agent.
Search Google for official 2025/2026 undergraduate admissions data for:
Institution: ${univ.name} (${univ.countryName})
Current QS Rank: ${univ.globalRankQS}
Current Annual Tuition: ${univ.tuitionAnnual?.localAmount || univ.annualTuition}
Current Acceptance Rate: ${univ.acceptanceRate}
Current Cutoff: ${univ.cutoffScore}

Verify and return JSON with keys:
{
  "globalRankQS": number,
  "nationalRank": number,
  "rankingBody": string,
  "acceptanceRate": string,
  "annualTuition": string,
  "cutoffScore": string
}`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          let text = response.text || "";
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) text = jsonMatch[1];
          const update = JSON.parse(text.trim());
          const { decisions } = validateUpdate(univ, update);
          allDecisions.push(...decisions);
        } catch (err) {
          console.warn(`[Network / API Notice] Live query unavailable for ${univ.id}: ${(err as Error).message}`);
          networkErrorEncountered = true;
          break;
        }
      }

      if (networkErrorEncountered || allDecisions.length === 0) {
        console.log("\n[Fallback] Falling back to deterministic guardrail & schema verification...");
        allDecisions.length = 0;
        runDeterministicSimulation();
      }
    }

    console.log("\n--- VERIFICATION DIFF TABLE ---");
    renderDiffTable(allDecisions);

    const acceptedCount = allDecisions.filter((d) => d.verdict === "ACCEPTED").length;
    const rejectedCount = allDecisions.filter((d) => d.verdict === "REJECTED").length;

    console.log(`\n[Dry-Run Summary] Total Evaluated: ${allDecisions.length} fields | Accepted: ${acceptedCount} | Rejected by Guardrails: ${rejectedCount}`);
    console.log("[Dry-Run Complete] 0 files modified on disk. Exiting with code 0.\n");
    process.exit(0);
  }

  // PRODUCTION MODE
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required for production data sync.");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const batchSize = 20;
  const allDecisions: GuardrailDecision[] = [];
  const updatedUniversitiesMap = new Map<string, Partial<University>>();

  console.log(`[Production Sync] Starting batch verification of ${UNIVERSITIES.length} universities in chunks of ${batchSize}...`);

  for (let i = 0; i < UNIVERSITIES.length; i += batchSize) {
    const batch = UNIVERSITIES.slice(i, i + batchSize);
    console.log(`Processing Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(UNIVERSITIES.length / batchSize)} (${batch.length} institutions)...`);

    for (const univ of batch) {
      try {
        const prompt = `You are FindMyCampus admissions verification agent.
Search Google for official 2025/2026 undergraduate admissions data for:
Institution: ${univ.name} (${univ.countryName})
Current QS Rank: ${univ.globalRankQS}
Current Annual Tuition: ${univ.tuitionAnnual?.localAmount || univ.annualTuition}
Current Acceptance Rate: ${univ.acceptanceRate}
Current Cutoff: ${univ.cutoffScore}

Verify and return JSON with keys:
{
  "globalRankQS": number,
  "nationalRank": number,
  "rankingBody": string,
  "acceptanceRate": string,
  "annualTuition": string,
  "cutoffScore": string
}`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        let text = response.text || "";
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) text = jsonMatch[1];
        const update = JSON.parse(text.trim());

        const { validated, decisions } = validateUpdate(univ, update);
        allDecisions.push(...decisions);

        if (Object.keys(validated).length > 0) {
          updatedUniversitiesMap.set(univ.id, validated);
        }
      } catch (err) {
        console.warn(`[Batch Warning] Verification skipped for ${univ.id}:`, (err as Error).message);
      }
    }

    if (i + batchSize < UNIVERSITIES.length) {
      console.log("Awaiting 1500ms rate-limit cooldown...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  renderDiffTable(allDecisions);

  const acceptedCount = allDecisions.filter((d) => d.verdict === "ACCEPTED").length;
  const rejectedCount = allDecisions.filter((d) => d.verdict === "REJECTED").length;

  console.log(`\n[Production Sync Summary] Total Checks: ${allDecisions.length} | Accepted: ${acceptedCount} | Rejected by Guardrails: ${rejectedCount}`);

  if (updatedUniversitiesMap.size === 0) {
    console.log("No data updates needed this month.");
    process.exit(0);
  }

  // Apply updates to country partitions in memory
  const applyUpdatesToPartition = (list: University[]) => {
    for (const item of list) {
      const update = updatedUniversitiesMap.get(item.id);
      if (update) {
        Object.assign(item, update);
      }
    }
  };

  applyUpdatesToPartition(universitiesIndia);
  applyUpdatesToPartition(universitiesUS);
  applyUpdatesToPartition(universitiesUK);
  applyUpdatesToPartition(universitiesCanada);
  applyUpdatesToPartition(universitiesGermany);
  applyUpdatesToPartition(universitiesAustralia);
  applyUpdatesToPartition(universitiesOther);

  // Assert counts strictly match
  if (
    universitiesIndia.length !== initialCounts.IN ||
    universitiesUS.length !== initialCounts.US ||
    universitiesUK.length !== initialCounts.UK ||
    universitiesCanada.length !== initialCounts.CA ||
    universitiesGermany.length !== initialCounts.DE ||
    universitiesAustralia.length !== initialCounts.AU ||
    universitiesOther.length !== initialCounts.Other
  ) {
    throw new Error("Dataset count mismatch! Aborting write to prevent data corruption.");
  }

  // Write updated files to disk
  const writePartition = (relPath: string, exportName: string, data: University[]) => {
    const fullPath = path.join(rootDir, relPath);
    const content = `import type { University } from "@/types/university";\n\nexport const ${exportName}: University[] = ${JSON.stringify(data, null, 2)};\n`;
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Updated ${relPath} (${data.length} records)`);
  };

  writePartition("lib/data/universitiesIndia.ts", "universitiesIndia", universitiesIndia);
  writePartition("lib/data/universitiesUS.ts", "universitiesUS", universitiesUS);
  writePartition("lib/data/universitiesUK.ts", "universitiesUK", universitiesUK);
  writePartition("lib/data/universitiesCanada.ts", "universitiesCanada", universitiesCanada);
  writePartition("lib/data/universitiesGermany.ts", "universitiesGermany", universitiesGermany);
  writePartition("lib/data/universitiesAustralia.ts", "universitiesAustralia", universitiesAustralia);
  writePartition("lib/data/universitiesOther.ts", "universitiesOther", universitiesOther);

  // Update LAST_DATA_SYNC in lib/data/universities.ts
  const universitiesFilePath = path.join(rootDir, "lib/data/universities.ts");
  const currentUniversitiesContent = fs.readFileSync(universitiesFilePath, "utf8");
  const newSyncTimestamp = new Date().toISOString();
  const updatedUniversitiesContent = currentUniversitiesContent.replace(
    /export const LAST_DATA_SYNC = ".*?";/,
    `export const LAST_DATA_SYNC = "${newSyncTimestamp}";`
  );
  fs.writeFileSync(universitiesFilePath, updatedUniversitiesContent, "utf8");
  console.log(`Updated LAST_DATA_SYNC to ${newSyncTimestamp} in lib/data/universities.ts`);

  console.log("Autonomous data verification completed successfully.");
}

main().catch((err) => {
  console.error("Fatal error in syncUniversityData:", err);
  process.exit(1);
});
