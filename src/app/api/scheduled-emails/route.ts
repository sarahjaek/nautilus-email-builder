//list and cancellation route

import { NextResponse } from "next/server";
import { WorkflowNotFoundError } from "@temporalio/client";
import { withTemporalClient } from "../../temporal/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const taskQueue =
  process.env.TEMPORAL_TASK_QUEUE ?? "email-sending";

// GET /api/scheduled-emails
export async function GET() {
  try {
    const emails = await withTemporalClient(async (client) => {
      const rows = [];
      let inspected = 0;

      for await (const workflow of client.workflow.list({
        query: "WorkflowType = 'scheduledEmail'",
        pageSize: 100,
      })) {
        // Limit this demo endpoint to the latest 100 executions.
        inspected += 1;

        if (
          workflow.taskQueue === taskQueue &&
          workflow.workflowId.startsWith("email-")
        ) {
          const memo = workflow.memo ?? {};

          rows.push({
            workflowId: workflow.workflowId,
            runId: workflow.runId,
            recipient:
              typeof memo.recipient === "string"
                ? memo.recipient
                : "Unknown recipient",
            subject:
              typeof memo.subject === "string"
                ? memo.subject
                : "Unknown subject",
            sendAt:
              typeof memo.sendAt === "string"
                ? memo.sendAt
                : null,
            status: workflow.status.name,
            createdAt: workflow.startTime.toISOString(),
          });
        }

        if (inspected >= 100) break;
      }

      return rows.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    });

    return NextResponse.json(
      { emails },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to list scheduled emails:", error);

    return NextResponse.json(
      { error: "Failed to load scheduled emails" },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduled-emails
export async function DELETE(request: Request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { workflowId, runId } = body ?? {};

  if (
    typeof workflowId !== "string" ||
    !workflowId.startsWith("email-") ||
    typeof runId !== "string" ||
    !runId
  ) {
    return NextResponse.json(
      { error: "Invalid workflow identifiers" },
      { status: 400 }
    );
  }

  try {
    return await withTemporalClient(async (client) => {
      const handle = client.workflow.getHandle(workflowId, runId);
      const workflow = await handle.describe();

      if (
        workflow.type !== "scheduledEmail" ||
        workflow.taskQueue !== taskQueue
      ) {
        return NextResponse.json(
          { error: "Scheduled email not found" },
          { status: 404 }
        );
      }

      if (workflow.status.name !== "RUNNING") {
        return NextResponse.json(
          { error: "This workflow has already finished" },
          { status: 409 }
        );
      }

      await handle.cancel();

      return NextResponse.json(
        { message: "Cancellation requested" },
        { status: 202 }
      );
    });
  } catch (error) {
    if (error instanceof WorkflowNotFoundError) {
      return NextResponse.json(
        { error: "Scheduled email not found" },
        { status: 404 }
      );
    }

    console.error("Failed to cancel scheduled email:", error);

    return NextResponse.json(
      { error: "Failed to request cancellation" },
      { status: 500 }
    );
  }
}