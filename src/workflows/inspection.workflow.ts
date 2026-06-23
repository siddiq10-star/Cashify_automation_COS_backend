// src/workflows/inspection.workflow.ts

import { Page } from "playwright";
import { QuestionEngine } from "../engines/question.engine";
import { DefectEngine } from "../engines/defect.engine";
import { AccessoryEngine } from "../engines/accessory.engine";
import { waitIfPaused } from "../utils/jobGuard";

export async function runInspectionFlow(
  page: Page,
  jobId?: string
) {

  const questionEngine =
    new QuestionEngine(page);

  await questionEngine.answerAllQuestions();

  await waitIfPaused(jobId);

  const defectEngine =
    new DefectEngine(page);

  await defectEngine.skipDefects();

  await waitIfPaused(jobId);

  const accessoryEngine =
    new AccessoryEngine(page);

  await accessoryEngine.selectAccessories();

  await waitIfPaused(jobId);
}