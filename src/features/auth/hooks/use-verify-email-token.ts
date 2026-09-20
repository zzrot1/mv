"use client";

import { useEffect, useRef } from "react";

import { getErrorMessage } from "@/core/api-error";
import { useVerifyEmail } from "@/service-api/generated/endpoints/auth/auth";

export function useVerifyEmailToken(token?: string) {
  const hasSubmitted = useRef(false);
  const mutation = useVerifyEmail({
    request: token ? { params: { token } } : undefined,
  });

  useEffect(() => {
    if (!token || hasSubmitted.current) {
      return;
    }

    hasSubmitted.current = true;
    mutation.mutate();
  }, [mutation, token]);

  return {
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : undefined,
    isError: mutation.isError,
    isMissingToken: !token,
    isPending: mutation.isPending || mutation.isIdle,
    isSuccess: mutation.isSuccess,
    retry: () => {
      if (!token) {
        return;
      }

      mutation.reset();
      mutation.mutate();
    },
  };
}
