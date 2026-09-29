import { NextRequest } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

async function proxy(
  request: NextRequest,
  path: string,
) {
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");

  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const response = await fetch(
    `${backendUrl}/auth/${path}`,
    {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    },
  );

  const responseHeaders = new Headers();

  const contentTypeResponse =
    response.headers.get("content-type");

  if (contentTypeResponse) {
    responseHeaders.set(
      "content-type",
      contentTypeResponse,
    );
  }

  const setCookies =
    response.headers.getSetCookie?.() ?? [];

  for (const setCookie of setCookies) {
    responseHeaders.append(
      "set-cookie",
      setCookie,
    );
  }

  return new Response(
    await response.arrayBuffer(),
    {
      status: response.status,
      headers: responseHeaders,
    },
  );
}

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Context,
) {
  const { path } = await params;
  return proxy(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: Context,
) {
  const { path } = await params;
  return proxy(request, path.join("/"));
}
