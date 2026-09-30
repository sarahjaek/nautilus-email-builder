// src/app/editor/page.tsx
// the page that shows the editor--imports editor and passes to puck
"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./config";

const initialData = { content: [], root: {} };

export default function EditorPage() {
  return (<Puck 
            config={config} 
            data={{}} 
            onPublish={(data) => { // Called when user presses publish, hands finished page as json.
                console.log(data);
              }} />)
}
