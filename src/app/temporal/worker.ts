// worker stays running until temporal gives it work

import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
    }
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
    tls: process.env.TEMPORAL_TLS === "true",
  ...  (process.env.TEMPORAL_API_KEY
    ?   { apiKey: process.env.TEMPORAL_API_KEY }
    :   {}),
  });

  try {
    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
      taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "email-sending",
      workflowsPath: require.resolve("./workflows"),
      activities,
    });

    console.log("Email worker is running");
    await worker.run();
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

