import { Resend } from "resend";
import type { ScheduledEmailInput } from "./types";

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

  if (error || !data) {
    throw new Error(error?.message ?? "No email ID returned");
  }

  return { id: data.id };
}