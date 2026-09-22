import { type NextRequest, NextResponse } from "next/server";

const backendOrigin = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const allowedPathPrefixes = [
  "auth",
  "profile",
  "products",
  "stocks",
  "stock-items",
  "sales",
  "cart",
] as const;

function isAllowedProxyPath(path: string[]) {
  if (!Array.isArray(path) || path.length === 0) {
    return false;
  }

  const joined = path.join("/");
  return allowedPathPrefixes.some(
    (prefix) => joined === prefix || joined.startsWith(`${prefix}/`),
  );
}

const hopByHop = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "expect",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function isLocalHttpRequest(request: NextRequest) {
  return (
    request.nextUrl.protocol === "http:" &&
    (request.nextUrl.hostname === "localhost" ||
      request.nextUrl.hostname === "127.0.0.1")
  );
}

function rewriteSetCookie(cookie: string, stripSecure: boolean) {
  let rewritten = cookie.replace(/;\s*Domain=[^;]*/gi, "");
  if (stripSecure) {
    rewritten = rewritten.replace(/;\s*Secure/gi, "");
  }
  return rewritten;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  if (!isAllowedProxyPath(path)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const target = new URL(`/api/${path.join("/")}`, backendOrigin);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstream = await fetch(target, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (hopByHop.has(key.toLowerCase()) || key.toLowerCase() === "set-cookie") {
      return;
    }
    responseHeaders.set(key, value);
  });

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  const stripSecure = isLocalHttpRequest(request);

  for (const cookie of cookies) {
    responseHeaders.append("set-cookie", rewriteSetCookie(cookie, stripSecure));
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
