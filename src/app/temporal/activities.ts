import { Resend } from "resend";
import type { ScheduledEmailInput } from "./types";
import { ApplicationFailure } from "@temporalio/activity";

export async function sendEmail(input: ScheduledEmailInput) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: input.recipient,
      subject: input.subject,
      html: input.html,
    },
    {
      idempotencyKey: `scheduled-email/${input.emailId}`,
    }
  );

  if (error) {
    const status = error.statusCode;
  
    // Retry temporary failures: timeout, rate limit, and server errors.
    const retryable =
      status == null ||
      status === 408 ||
      status === 429 ||
      status >= 500;
  
    if (!retryable) {
      throw ApplicationFailure.nonRetryable(
        error.message,
        "PermanentEmailError"
      );
    }
  
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error("No email ID returned");
  }

  return { id: data.id };
}