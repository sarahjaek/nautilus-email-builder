// src/app/editor/page.tsx
// the page that shows the editor--imports editor and passes to puck
"use client";

import { useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./config";

const initialData = { content: [], root: {} };

export default function EditorPage() {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [puckData, setPuckData] = useState<Data>(initialData); // latest editor contents, updated on every change

  return (<Puck
            config={config}
            data={{}}
            onChange={setPuckData}
            onPublish={(data) => { // Called when user presses publish, hands finished page as json.
                console.log(data);
              }} />)
}
