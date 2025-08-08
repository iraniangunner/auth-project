import { decryptSession } from "@/app/utils/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get("clb-session")?.value;

  if (!encryptedSession) {
    return NextResponse.json(
      { error: "Session not found" },
      {
        status: 400,
      }
    );
  }
  const session = await decryptSession(encryptedSession);
  return NextResponse.json(session);
}
