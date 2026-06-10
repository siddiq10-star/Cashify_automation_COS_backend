import { google } from "googleapis";
import * as path from "path";

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
    this.spreadsheetId = "1UJx7HmZokfl5z6nEdXEx1ub5O1Enj_uWyT3EstCszg4";
  }

  // =========================================================
  // ➤ APPEND SINGLE ROW
  // =========================================================
  async appendRow(row: any[]) {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:G",
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
        range: "Sheet1!A:G",
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
      range: "Sheet1!A2:J",
    });

    const rows = res.data.values || [];

    return rows.map((row: any[], index: number) => ({
      brand: row[0] || "",
      model: row[1] || "",
      variant: row[2] || "",
      maxValue: row[3] || "",
      below3: row[4] || "",
      months3to6: row[5] || "",
      months6to11: row[6] || "",
      above11: row[7] || "",
      status: row[8] || "",
      lastUpdated: row[9] || "",
      valueChanged: row[10] || "",
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
        range: `Sheet1!A${rowIndex}:K${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (error) {
      console.error("❌ updateRow error:", error);
    }
  }

  // =========================================================
  // ➤ CLEAR SHEET (UTILITY)
  // =========================================================
  async clearSheet(range: string = "Sheet1") {
    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      console.log("🧹 Sheet cleared");
    } catch (error) {
      console.error("❌ clearSheet error:", error);
    }
  }
}