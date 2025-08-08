import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { UserSession } from "../_types/auth.types";
import { cookies } from "next/headers";

const JWT_SECRET = "XaXLbR6Vm5MustpZshqjmLdcy81wQ+T2QqhhGuBa1Z4=";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function encryptSession(session: UserSession): Promise<string> {
  return new SignJWT(session as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(encodedKey);
}

export async function decryptSession(session: string) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  try {
    const sessionCookie = cookieStore.get("clb-session")?.value;
    if (!sessionCookie) {
      return null;
    }
    const session = (await decryptSession(
      sessionCookie
    )) as unknown as UserSession;
    return session;
  } catch {
    return null;
  }
}
