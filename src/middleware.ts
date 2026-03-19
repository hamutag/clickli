import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TOKEN_PREFIX = "clickli_admin_";

async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }

  const lastDotIndex = token.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return false;
  }

  const payload = token.slice(0, lastDotIndex);
  const signature = token.slice(lastDotIndex + 1);

  if (!payload.startsWith(ADMIN_TOKEN_PREFIX)) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payloadData = encoder.encode(payload);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadData);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page and auth API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth/")) {
    return NextResponse.next();
  }

  // Protect /admin/* and /api/admin/*
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret || !token || !(await verifyToken(token, secret))) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
