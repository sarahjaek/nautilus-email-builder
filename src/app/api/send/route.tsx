// src/app/api/send/route.tsx
// receives the email from the editor, turns it into HTML, sends it with resend

import type { Data } from "@puckeditor/core";
import { Resend } from "resend";
import { renderEmail } from "../../editor/renderEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // 1. read what the page sent
  const { recipient, subject, data } = (await request.json()) as {
    recipient: string;
    subject: string;
    data: Data;
  };

  // 2. check the input before using it
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient ?? "")) {
    return Response.json({ error: "Invalid recipient email" }, { status: 400 });
  }
  if (!subject?.trim()) {
    return Response.json({ error: "Subject is required" }, { status: 400 });
  }
  if (!Array.isArray(data?.content) || data.content.length === 0) {
    return Response.json({ error: "Email content is required" }, { status: 400 });
  }

  // 3. turn the puck data into email html, using the same config as the editor
  let html: string;
  try {
    html = await renderEmail(data);
  } catch (err) {
    console.error("Failed to render email:", err);
    return Response.json({ error: "Failed to render email" }, { status: 500 });
  }

  // 4. send it
  const { data: sent, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: recipient,
    subject,
    html,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ id: sent.id });
}
