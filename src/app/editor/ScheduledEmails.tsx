// list component

"use client";

import { useCallback, useEffect, useState } from "react";

type ScheduledEmail = {
  workflowId: string;
  runId: string;
  recipient: string;
  subject: string;
  sendAt: string | null;
  status: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  RUNNING: "Pending / processing",
  COMPLETED: "Accepted by email provider",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  TERMINATED: "Terminated",
  TIMED_OUT: "Timed out",
};

export default function ScheduledEmails({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/scheduled-emails", {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Failed to load emails");
      }

      setEmails(result.emails);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load emails"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmails();
  }, [loadEmails, refreshKey]);

  async function cancelEmail(email: ScheduledEmail) {
    setCancellingId(email.workflowId);
    setMessage("");

    try {
      const res = await fetch("/api/scheduled-emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: email.workflowId,
          runId: email.runId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Failed to cancel email");
      }

      setMessage(
        "Cancellation requested. Refresh shortly to check its status."
      );

      await loadEmails();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to cancel email"
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <section className="shrink-0 border-t bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Scheduled emails</h2>

        <button
          onClick={() => {
            setMessage("");
            void loadEmails();
          }}
          disabled={loading}
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && (
        <p role="status" className="mb-2 text-sm">
          {message}
        </p>
      )}

      <div className="max-h-48 overflow-auto">
        {emails.length === 0 ? (
          <p className="text-sm text-gray-500">
            {loading ? "Loading emails..." : "No scheduled emails found."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">To</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Send time</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {emails.map((email) => (
                <tr
                  key={email.runId}
                  className="border-b"
                >
                  <td className="p-2">{email.recipient}</td>
                  <td className="p-2">{email.subject}</td>
                  <td className="p-2">
                    {email.sendAt
                      ? new Date(email.sendAt).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td className="p-2">
                    {statusLabels[email.status] ?? email.status}
                  </td>
                  <td className="p-2">
                    {email.status === "RUNNING" && (
                      <button
                        onClick={() => void cancelEmail(email)}
                        disabled={cancellingId !== null}
                        className="rounded border border-red-300 px-3 py-1 text-red-700 disabled:opacity-50"
                      >
                        {cancellingId === email.workflowId
                          ? "Requesting..."
                          : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}