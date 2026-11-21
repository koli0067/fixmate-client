// src/lib/jwt-token.ts
const baseUrl =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.email ? String(payload.email).trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function getValidToken(
  email?: string | null,
  name?: string | null
): Promise<string | null> {
  if (typeof window === "undefined" || !email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const existing =
    localStorage.getItem("token") || localStorage.getItem("auth_token");

  // যদি আগের টোকেন থাকে এবং সেটি বর্তমান ইউজারেরই হয়, তবে সেটাই ফেরত দাও
  if (existing && decodeJwtEmail(existing) === normalizedEmail) {
    return existing;
  }

  // অন্য ইউজারের টোকেন হলে মুছে নতুন করে বর্তমান ইউজারের টোকেন আনো
  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");

  try {
    const res = await fetch(`${baseUrl}/api/auth/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, name: name || "" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.token) {
      localStorage.setItem("token", data.token);
      return data.token as string;
    }
  } catch (err) {
    console.error("Failed to sync JWT token:", err);
  }

  return null;
}

export function clearJwtToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
  }
}