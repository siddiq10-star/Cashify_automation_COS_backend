import { GoogleSheetsService }
from "../services/googleSheets.service";

export async function updateSheetPricing(
  rowIndex: number,
  maxValue: number,
  ageResults: any[]
) {

  const sheet =
    new GoogleSheetsService();

  console.log(
    "🔥 GOOGLE SHEET UPDATE START"
  );

  const below3 =
    ageResults.find(
      a => a.age.includes("Below 3")
    )?.difference ?? 0;

  const mid3to6 =
    ageResults.find(
      a => a.age.includes("3 months - 6")
    )?.difference ?? 0;

  const mid6to11 =
    ageResults.find(
      a => a.age.includes("6 months - 11")
    )?.difference ?? 0;

  const above11 =
    ageResults.find(
      a => a.age.includes("Above 11")
    )?.difference ?? 0;

  console.log(
    "AGE RESULTS:",
    JSON.stringify(ageResults, null, 2)
  );

  await sheet.updatePricingRow(
    rowIndex,
    maxValue,
    below3,
    mid3to6,
    mid6to11,
    above11
  );

  console.log(
    "WRITING TO SHEET:",
    {
      rowIndex,
      maxValue,
      below3,
      mid3to6,
      mid6to11,
      above11,
    }
  );

  console.log(
    "🔥 GOOGLE SHEET UPDATE FINISHED"
  );

  console.log(
    `✅ Sheet Updated Row ${rowIndex}`
  );
}