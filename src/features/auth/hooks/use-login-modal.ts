"use client";

import { useCallback, useEffect, useState } from "react";

export function useLoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLoginModal();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLoginModal, isOpen]);

  return {
    closeLoginModal,
    isOpen,
    openLoginModal,
  };
}
