import { NextResponse } from "next/server";
import { Client, Connection } from "@temporalio/client";
import type { Data } from "@puckeditor/core";
import { renderEmail } from "../../editor/renderEmail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { recipient, subject, data, sendAt } = body ?? {};

  if (
    typeof recipient !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)
  ) {
    return NextResponse.json(
      { error: "Invalid recipient email" },
      { status: 400 }
    );
  }

  if (typeof subject !== "string" || !subject.trim()) {
    return NextResponse.json(
      { error: "Subject is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(data?.content) || data.content.length === 0) {
    return NextResponse.json(
      { error: "Email content is required" },
      { status: 400 }
    );
  }

  const timestamp =
    typeof sendAt === "string" ? Date.parse(sendAt) : NaN;

  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
    return NextResponse.json(
      { error: "Choose a future send time" },
      { status: 400 }
    );
  }

  try {
    // Save the email's current appearance as HTML.
    const html = await renderEmail(data as Data);
    const emailId = crypto.randomUUID();

    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
      tls: process.env.TEMPORAL_TLS === "true",
      ...(process.env.TEMPORAL_API_KEY
        ? { apiKey: process.env.TEMPORAL_API_KEY }
        : {}),
    });

    try {
      const client = new Client({
        connection,
        namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
      });

      // Start the workflow and return without waiting for delivery.
      const handle = await client.workflow.start("scheduledEmail", {
        memo: { // provides display information returned when listing workflows
            recipient,
            subject: subject.trim(),
            sendAt: new Date(timestamp).toISOString(),
          },
        taskQueue:
          process.env.TEMPORAL_TASK_QUEUE ?? "email-sending",
        workflowId: `email-${emailId}`,
        args: [
          {
            emailId,
            recipient,
            subject: subject.trim(),
            html,
            sendAt: new Date(timestamp).toISOString(),
          },
        ],
      });

      return NextResponse.json(
        { workflowId: handle.workflowId },
        { status: 202 }
      );
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error("Failed to schedule email:", error);

    return NextResponse.json(
      { error: "Failed to schedule email" },
      { status: 500 }
    );
  }
}