// src/app/editor/page.tsx
// the page that shows the editor--imports editor and passes to puck
"use client";

import { useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./config";

const initialData = { content: [], root: {} };

type Status = "idle" | "sending" | "success" | "error";

// notification text and color for each status (idle shows nothing)
const notifications = {
  sending: { message: "Sending email...", className: "bg-blue-600" },
  success: { message: "Email sent!", className: "bg-green-600" },
  error: { message: "Failed to send email.", className: "bg-red-600" },
};

export default function EditorPage() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [puckData, setPuckData] = useState<Data>(initialData); // latest editor contents, updated on every change
  const [status, setStatus] = useState<Status>("idle");

  // sends the current email to the server route, which renders it to html and sends it with resend
  async function handleSend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, subject, data: puckData }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error"); // network failure
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* email details bar, sits above the editor */}
      <div className="flex gap-4 border-b border-gray-200 bg-white px-4 py-3">
        <label className="flex flex-1 items-center gap-2 text-sm font-medium">
          To
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 font-normal"
          />
        </label>
        <label className="flex flex-1 items-center gap-2 text-sm font-medium">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 font-normal"
          />
        </label>
        <button
          onClick={handleSend}
          disabled={status === "sending"}
          className="rounded px-4 py-1.5 text-sm font-medium text-white"
          style={{ backgroundColor: "#000000", opacity: status === "sending" ? 0.5 : 1 }}
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>

      {/* min-h-0 lets the editor shrink to the space left under the bar */}
      <div className="min-h-0 flex-1">
        <Puck
            config={config}
            data={{}}
            height="100%"
            onChange={setPuckData}
            onPublish={(data) => { // Called when user presses publish, hands finished page as json.
                console.log(data);
              }} />
      </div>
      {status !== "idle" && (
        <div className={`fixed bottom-4 right-4 z-50 rounded px-4 py-2 text-white shadow-lg ${notifications[status].className}`}>
          {notifications[status].message}
        </div>
      )}
    </div>
  )
}
