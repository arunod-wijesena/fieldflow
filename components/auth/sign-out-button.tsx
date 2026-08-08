"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [error, setError] = useState("");

    async function handleSignOut() {
        setIsSigningOut(true);
        setError("");

        try {
            const response = await authClient.signOut();

            if (response.error) {
                setError("Unable to sign out. Please try again.");
                return;
            }

            router.replace("/login");
            router.refresh();
        } catch {
            setError("Unable to sign out. Please try again.");
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSigningOut ? "Signing out..." : "Sign out"}
            </button>

            {error ? (
                <p className="text-sm text-red-700" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}