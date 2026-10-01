// helper opens a connection, runs the supplied operation, and closes connection

import { Client, Connection } from "@temporalio/client";

export async function withTemporalClient<T>(
  operation: (client: Client) => Promise<T>
): Promise<T> {
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

    return await operation(client);
  } finally {
    await connection.close();
  }
}