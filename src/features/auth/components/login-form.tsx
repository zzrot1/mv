"use client";

import { type FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getErrorMessage,
  getErrorStatus,
  setAccessToken,
} from "orval-data-handler";
import {
  useLogin,
  useRegister,
  useResendVerificationEmail,
} from "@/service-api/generated/endpoints/auth/auth";

import { AppleIcon, BrandMarkIcon, GoogleIcon } from "./auth-icons";
import { LoginSocialButton } from "./login-social-button";
import styles from "../styles/login-modal.module.css";

type LoginFormProps = {
  onLoginSuccess?: () => void;
};

type AuthMode = "login" | "register" | "verifyEmail";

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const queryClient = useQueryClient();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [verificationEmail, setVerificationEmail] = useState<string>();

  const loginMutation = useLogin({
    mutation: {
      onError: (error, variables) => {
        if (getErrorStatus(error) === 403) {
          setVerificationEmail(variables.data.email);
          setAuthMode("verifyEmail");
          setErrorMessage(undefined);
          setSuccessMessage(
            "Please verify your email before logging in. You can resend the verification email below.",
          );
          return;
        }

        setErrorMessage(getErrorMessage(error));
      },
      onSuccess: (response) => {
        // Access token-ul se tine in memorie si pleaca ca header Authorization;
        // in cookie sta doar refresh token-ul, httpOnly.
        setAccessToken(response.tokens.access.token);

        setErrorMessage(undefined);
        setSuccessMessage(undefined);
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        onLoginSuccess?.();
      },
    },
  });
  const registerMutation = useRegister({
    mutation: {
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
      },
      onSuccess: (response, variables) => {
        setVerificationEmail(response.user.email || variables.data.email);
        setErrorMessage(undefined);
        setSuccessMessage(
          "Account created. Please check your email and verify your account before logging in.",
        );
        setAuthMode("verifyEmail");
      },
    },
  });
  const resendVerificationMutation = useResendVerificationEmail({
    mutation: {
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
        setSuccessMessage(undefined);
      },
      onSuccess: () => {
        setErrorMessage(undefined);
        setSuccessMessage("Verification email sent. Please check your inbox.");
      },
    },
  });

  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    resendVerificationMutation.isPending;
  const isRegisterMode = authMode === "register";
  const isVerifyEmailMode = authMode === "verifyEmail";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    const payload = {
      data: {
        email,
        password,
      },
    };

    if (isRegisterMode) {
      registerMutation.mutate(payload);
      return;
    }

    loginMutation.mutate(payload);
  }

  function handleAuthModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
  }

  function handleResendVerificationEmail() {
    if (!verificationEmail) {
      setErrorMessage("Please enter your email again to resend verification.");
      setAuthMode("login");
      return;
    }

    resendVerificationMutation.mutate({
      data: {
        email: verificationEmail,
      },
    });
  }

  if (isVerifyEmailMode) {
    return (
      <div className={styles.loginCard}>
        <div className={styles.form}>
          <div className={styles.cardHeader}>
            <a className={styles.logoLink} href="#" aria-label="Home">
              <span className={styles.logoMark}>
                <BrandMarkIcon />
              </span>
            </a>
            <h1 className={styles.title}>Verify your email</h1>
            <p className={styles.description}>
              We sent a verification link to{" "}
              <span className={styles.strongText}>{verificationEmail}</span>.
            </p>
          </div>

          {successMessage ? (
            <p className={styles.successMessage} role="status">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            className={styles.primaryButton}
            disabled={isPending}
            onClick={handleResendVerificationEmail}
            type="button"
          >
            {resendVerificationMutation.isPending
              ? "Sending..."
              : "Resend verification email"}
          </button>

          <button
            className={styles.inlineButton}
            onClick={() => handleAuthModeChange("login")}
            type="button"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginCard}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <a className={styles.logoLink} href="#" aria-label="Home">
            <span className={styles.logoMark}>
              <BrandMarkIcon />
            </span>
          </a>
          <h1 className={styles.title}>
            {isRegisterMode
              ? "Create your account"
              : "Welcome to Books & Culture"}
          </h1>
          <p className={styles.description}>
            {isRegisterMode
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              className={styles.inlineButton}
              onClick={() =>
                handleAuthModeChange(isRegisterMode ? "login" : "register")
              }
              type="button"
            >
              {isRegisterMode ? "Login" : "Sign up"}
            </button>
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            className={styles.input}
            id="login-email"
            name="email"
            placeholder="m@example.com"
            required
            type="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-password">
            Password
          </label>
          <input
            className={styles.input}
            id="login-password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>

        {errorMessage ? (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        ) : null}

        <button
          className={styles.primaryButton}
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? isRegisterMode
              ? "Creating account..."
              : "Logging in..."
            : isRegisterMode
              ? "Sign up"
              : "Login"}
        </button>

        <div className={styles.separator}>
          <span>Or</span>
        </div>

        <div className={styles.socialGrid}>
          <LoginSocialButton icon={<AppleIcon />}>
            Continue with Apple
          </LoginSocialButton>
          <LoginSocialButton icon={<GoogleIcon />}>
            Continue with Google
          </LoginSocialButton>
        </div>
      </form>

      <p className={styles.terms}>
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </p>
    </div>
  );
}
