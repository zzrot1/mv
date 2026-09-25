"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LoginModal } from "@/features/auth/components/login-modal";
import { useLoginModal } from "@/features/auth/hooks/use-login-modal";
import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

export function LoginQueryParamHandler() {
  const loginModal = useLoginModal();
  const { closeLoginModal, isOpen, openLoginModal } = loginModal;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileQuery = useGetProfile({
    query: {
      retry: false,
    },
  });

  const removeLoginSearchParam = useCallback(() => {
    if (searchParams.get("login") !== "1") {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("login");
    const nextSearch = nextSearchParams.toString();

    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get("login") !== "1") {
      return;
    }

    if (profileQuery.isSuccess) {
      closeLoginModal();
      removeLoginSearchParam();
      return;
    }

    if (profileQuery.isError) {
      openLoginModal();
    }
  }, [
    closeLoginModal,
    openLoginModal,
    profileQuery.isError,
    profileQuery.isSuccess,
    removeLoginSearchParam,
    searchParams,
  ]);

  const handleClose = useCallback(() => {
    closeLoginModal();
    removeLoginSearchParam();
  }, [closeLoginModal, removeLoginSearchParam]);

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
