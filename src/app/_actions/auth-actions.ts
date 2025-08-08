"use server";
import { cookies, headers } from "next/headers";
import { SignInModel } from "../(auth)/_types/auth.types";
import { JWT, UserResponse, UserSession } from "../_types/auth.types";
import { jwtDecode } from "jwt-decode";
import { decryptSession, encryptSession } from "../utils/session";

export async function signinAction(model: SignInModel) {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");

  try {
    const response = await fetch(
      "https://general-api.classbon.com/api/identity/signin",
      {
        method: "POST",
        body: JSON.stringify({ ...model, userAgent }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      const user: UserResponse = await response.json();

      // 👇 set cookie here directly
      const decoded = jwtDecode<JWT>(user.accessToken);
      const session: UserSession = {
        username: decoded.username,
        fullName: decoded.fullName,
        pic: decoded.pic,
        exp: decoded.exp,
        accessToken: user.accessToken,
        sessionId: user.sessionId,
        sessionExpiry: user.sessionExpiry,
      };

      const cookieStore = await cookies();
      const encryptedSession = await encryptSession(session);
      cookieStore.set("clb-session", encryptedSession, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });

      return { isSuccess: true };
    }
  } catch (error) {
    return { isSuccess: false };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("clb-session")?.value;

  if (!sessionCookie) {
    return null;
  }

  const session = await decryptSession(sessionCookie);
  try {
    const response = await fetch(
      "https://general-api.classbon.com/api/identity/signout",
      {
        method: "POST",
        body: JSON.stringify({
          sessionId: (session as unknown as UserSession).sessionId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      cookieStore.delete("clb-session");
      return { isSuccess: true };
    }
  } catch {
    return { isSuccess: false };
  }
}
