// decides when activitiy happens

import { proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { ScheduledEmailInput } from "./types";

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 5,
  },
});

export async function scheduledEmail(input: ScheduledEmailInput) {
  const delay = Date.parse(input.sendAt) - Date.now();

  if (delay > 0) {
    await sleep(delay);
  }

  return await sendEmail(input);
}