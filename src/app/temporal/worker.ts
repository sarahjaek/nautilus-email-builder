// worker stays running until temporal gives it work

import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function main() {
  const connection = await NativeConnection.connect({
    address: "localhost:7233",
  });

  try {
    const worker = await Worker.create({
      connection,
      namespace: "default",
      taskQueue: "email-sending",
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