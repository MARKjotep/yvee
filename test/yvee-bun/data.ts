export type DemoRequestData = Record<string, unknown> & {
  ssr: {
    requestId: string;
    path: string;
    renderedAt: string;
    visitor: { name: string; plan: string };
    featureFlags: string[];
  };
  clientPost?: {
    method: string;
    accepted: boolean;
    receivedRequestId: string;
    receivedVisitor: string;
    serverProcessedAt: string;
  };
};

export interface PostPayloadResponse {
  method: string;
  accepted: boolean;
  receivedRequestId: string;
  receivedVisitor: string;
  serverProcessedAt: string;
}

export function createRequestData(path: string): DemoRequestData {
  return {
    ssr: {
      requestId: crypto.randomUUID(),
      path,
      renderedAt: new Date().toISOString(),
      visitor: { name: "Sample visitor", plan: "Field Notes" },
      featureFlags: ["route-metadata", "ssr-handoff", "client-post"],
    },
  };
}

export async function handlePayloadPost(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Use POST for this endpoint." },
      { status: 405 },
    );
  }

  let input: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return Response.json(
        { error: "Expected a JSON object." },
        { status: 400 },
      );
    }
    input = value as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const visitor =
    typeof input.visitor === "object" && input.visitor !== null
      ? (input.visitor as Record<string, unknown>)
      : {};
  return Response.json({
    method: request.method,
    accepted: true,
    receivedRequestId: String(input.requestId ?? "missing-request-id"),
    receivedVisitor: String(visitor.name ?? "anonymous"),
    serverProcessedAt: new Date().toISOString(),
  });
}

export { serializePayload } from "../../src/yvee";
