"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Shared "set a new password" behaviour for the signed-in user. Owns the
 * field state, validation, and the supabase.auth.updateUser call so the
 * recovery page and the in-app change-password modal don't each reimplement
 * it. On success the caller decides what happens next (close modal, redirect…)
 * via `onSuccess`.
 */
export function useUpdatePassword(onSuccess: () => void) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Check the fields without committing. Returns whether they're good to
  // submit, so callers can gate a confirmation step on valid input.
  const validate = () => {
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Commit the new password. Assumes validate() already passed.
  const submit = async () => {
    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    onSuccess();
  };

  return {
    password,
    setPassword,
    confirm,
    setConfirm,
    error,
    pending,
    validate,
    submit,
  };
}
