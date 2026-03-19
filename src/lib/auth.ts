import crypto from "crypto";

const ADMIN_TOKEN_PREFIX = "clickli_admin_";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return secret;
}

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const payload = `${ADMIN_TOKEN_PREFIX}${timestamp}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
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
      .createHmac("sha256", getSecret())
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

export function isAdminAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return false;
  }

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, ...valueParts] = cookie.trim().split("=");
      acc[key] = valueParts.join("=");
      return acc;
    },
    {} as Record<string, string>
  );

  const token = cookies["admin_token"];
  if (!token) {
    return false;
  }

  return verifyAdminToken(token);
}
