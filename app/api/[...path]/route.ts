import { NextRequest } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  const headers = new Headers();

  for (const name of [
    "accept",
    "content-type",
    "authorization",
    "cookie",
    "user-agent",
    "x-forwarded-for",
    "x-forwarded-proto",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const body =
    request.method === "GET" ||
    request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(
    `${backendUrl}/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    },
  );

  const responseHeaders = new Headers();

  for (const name of [
    "content-type",
    "cache-control",
    "etag",
  ]) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  for (const setCookie of response.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", setCookie);
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
