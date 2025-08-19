import { decryptSession, encryptSession } from "@/app/utils/session";
import { jwtDecode } from "jwt-decode";
import { JWT, UserResponse, UserSession } from "../../_types/auth.types"
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  const session = request.cookies.get("clb-session")?.value;

  const authRoutes = ["/signin"];
  const protectedRoutes = ["/dashboard"];

  const signinRoute = request.nextUrl.clone();

  const { nextUrl } = request;
  const nextResponse = NextResponse.next();

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (!session) {
    if (isProtectedRoute) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);

      signinRoute.pathname = "/signin";
      return NextResponse.redirect(`${signinRoute}?callbackUrl=${callbackUrl}`);
    } else {
      return nextResponse;
    }
  }

  try {
    const parsed = (await decryptSession(session)) as unknown as UserSession;
    const now = Date.now();
    const accessExpired = parsed.exp < now;
    const refreshExpired = parsed.sessionExpiry < now;

    if (!accessExpired && !refreshExpired && isAuthRoute) {
      const dashboardRoute = request.nextUrl.clone();
      dashboardRoute.pathname = "/dashboard/courses";
      return NextResponse.redirect(dashboardRoute);
    }

    if (refreshExpired) {
      const cookieStore = await cookies();
      cookieStore.delete("clb-session");

      signinRoute.pathname = "/signin";
      return NextResponse.redirect(signinRoute);
    }

    if (accessExpired && !refreshExpired) {
      try {
        const response = await fetch(
          "https://general-api.classbon.com/api/identity/refresh-token",
          {
            method: "POST",
            body: JSON.stringify({ sessionId: parsed.sessionId }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const user = (await response.json()) as unknown as UserResponse;
          const decoded = jwtDecode<JWT>(user.accessToken);
          const session: UserSession = {
            username: decoded.username,
            fullName: decoded.fullName,
            pic: decoded.pic,
            exp: decoded.exp * 1000,
            accessToken: user.accessToken,
            sessionId: user.sessionId,
            sessionExpiry: user.sessionExpiry * 1000,
          };

          const cookieStore = await cookies();
          const encryptedSession = await encryptSession(session);
          cookieStore.set("clb-session", encryptedSession, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
          });
        }
      } catch {
        signinRoute.pathname = "/signin";
        return NextResponse.redirect(`${signinRoute}`);
      }
    }
  } catch {
    return NextResponse.redirect(`${signinRoute}`);
  }

  return nextResponse;
}
