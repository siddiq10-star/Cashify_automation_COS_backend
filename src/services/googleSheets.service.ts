import { google } from "googleapis";
import * as path from "path";

import dotenv from "dotenv";
dotenv.config();

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    // =========================
    // AUTH (Service Account)
    // =========================
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });

    // =========================
    // YOUR SHEET ID
    // =========================
    this.spreadsheetId =
  process.env.GOOGLE_SHEET_ID || "";
  }

  // =========================================================
  // ➤ APPEND SINGLE ROW
  // =========================================================
  async appendRow(row: any[]) {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "testA:G",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (error) {
      console.error("❌ appendRow error:", error);
    }
  }

  // =========================================================
  // ➤ APPEND MULTIPLE ROWS (BATCH - RECOMMENDED)
  // =========================================================
  async appendRows(rows: any[][]) {
    if (!rows.length) return;

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "test!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: rows,
        },
      });

      console.log(`📊 ${rows.length} rows written to sheet`);
    } catch (error) {
      console.error("❌ appendRows error:", error);
    }
  }

  // =========================================================
  // ➤ READ MODELS FROM SHEET (NEW - FOR YOUR REQUIREMENT)
  // =========================================================
  async readModels() {
  try {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: "test!A2:N",
    });

    const rows = res.data.values || [];

    return rows.map((row, index) => ({
  city: row[0] || "",
  brandImageUrl: row[1] || "",
  imageUrl: row[2] || "",
  category: row[3] || "",
  productCode: row[4] || "",

  brand: row[5] || "",
  series: row[6] || "",
  model: row[7] || "",
  variant: row[8] || "",

  maxValue: row[9] || "",
  below3: row[10] || "",
  months3to6: row[11] || "",
  months6to11: row[12] || "",
  above11: row[13] || "",

  rowIndex: index + 2,
}));
  } catch (error) {
    console.error("❌ readModels error:", error);
    return [];
  }
}
  // =========================================================
  // ➤ UPDATE SPECIFIC ROW (CRITICAL FOR YOUR BOT)
  // =========================================================
  async updateRow(rowIndex: number, row: any[]) {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `test!A${rowIndex}:N${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (error) {
      console.error("❌ updateRow error:", error);
    }
  }



  async updatePricingRow(
  rowIndex: number,
  maxValue: number,
  below3: number,
  mid3to6: number,
  mid6to11: number,
  above11: number
) {
  try {

    // Read existing formula from J column
    const existing = await this.sheets.spreadsheets.values.get({
  spreadsheetId: this.spreadsheetId,
  range: `test!J${rowIndex}`,
  valueRenderOption: "FORMULA"
});

    const currentFormula =
      existing.data.values?.[0]?.[0] || "";

    let bonus = 0;

    // Example:
    // =111000+9000
    const match =
      String(currentFormula).match(/\+(\d+)/);

    if (match) {
      bonus = Number(match[1]);
    }

    const exact3to6 = maxValue - mid3to6;
    const exact6to11 = maxValue - mid6to11;
    const exactAbove11 = maxValue - above11;

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `test!J${rowIndex}:N${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          `=${maxValue}+${bonus}`,
          0,
          `=${exact3to6}-${maxValue}`,
          `=${exact6to11}-${maxValue}`,
          `=${exactAbove11}-${maxValue}`
        ]]
      }
    });

    console.log("✅ Formula Row Updated", {
      rowIndex,
      bonus
    });

  } catch (error) {
    console.error(
      "❌ updatePricingRow error:",
      error
    );
  }
}
}