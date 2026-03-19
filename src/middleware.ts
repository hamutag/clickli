import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_TOKEN_PREFIX = "clickli_admin_";

function verifyToken(token: string, secret: string): boolean {
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
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
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

  if (!secret || !token || !verifyToken(token, secret)) {
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
