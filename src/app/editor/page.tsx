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

  return (
    <>
      <Puck
            config={config}
            data={{}}
            onChange={setPuckData}
            onPublish={(data) => { // Called when user presses publish, hands finished page as json.
                console.log(data);
              }} />
      {status !== "idle" && (
        <div className={`fixed bottom-4 right-4 z-50 rounded px-4 py-2 text-white shadow-lg ${notifications[status].className}`}>
          {notifications[status].message}
        </div>
      )}
    </>
  )
}
