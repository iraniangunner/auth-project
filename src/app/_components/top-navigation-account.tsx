"use client";

import Image from "next/image";
import { useSessionStore } from "../_stores/auth.stroe";
import { Button } from "./button";
import { useTransition } from "react";
import { signOutAction } from "../_actions/auth-actions";
import { useRouter } from "next/navigation";
import { Loading } from "./loading";

export const TopNavigationAccount = () => {
  const status = useSessionStore((state) => state.status);
  const session = useSessionStore((state) => state.session);

  const clearSession = useSessionStore((state) => state.clearSession);

  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const response = await signOutAction();
      if (response.isSuccess) {
        clearSession();
        router.push("/");
      }
    });
  };

  if (status === "loading") {
    return <p></p>;
  }

  return (
    <>
      {status === "authenticated" ? (
        <div className="flex items-center gap-3">
          <Image
            className="rounded-full"
            src={session.pic}
            width={48}
            height={48}
            alt=""
          />
          <p>{session.fullName}</p>|
          <div onClick={handleSignOut} className="text-error cursor-pointer">
            {isPending ? (
              <Loading color="error" size="xs" text="" />
            ) : (
              <span className="">خروج</span>
            )}
          </div>
        </div>
      ) : (
        <Button variant="outlined" href="/signin">
          ورود به سایت
        </Button>
      )}
    </>
  );
};
