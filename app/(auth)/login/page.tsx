"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { loginSchema } from "@/lib/validation/login";

type FieldErrors = {
    email?: string;
    password?: string;
};

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFieldErrors({});
        setFormError("");

        const result = loginSchema.safeParse({
            email,
            password,
        });

        if (!result.success) {
            const flattenedErrors = result.error.flatten().fieldErrors;

            setFieldErrors({
                email: flattenedErrors.email?.[0],
                password: flattenedErrors.password?.[0],
            });

            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authClient.signIn.email({
                email: result.data.email,
                password: result.data.password,
            });

            if (response.error) {
                setFormError("Unable to sign in with the provided credentials.");
                return;
            }

            router.replace("/dashboard");
            router.refresh();
        } catch {
            setFormError("Unable to sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
                <div className="mb-6">
                    <p className="text-sm font-medium text-blue-700">FieldFlow</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                        Sign in
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Enter your account details to access FieldFlow.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label
                            className="mb-1 block text-sm font-medium text-slate-700"
                            htmlFor="email"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />

                        {fieldErrors.email ? (
                            <p
                                id="email-error"
                                className="mt-1 text-sm text-red-700"
                                role="alert"
                            >
                                {fieldErrors.email}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label
                            className="mb-1 block text-sm font-medium text-slate-700"
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.password)}
                            aria-describedby={
                                fieldErrors.password ? "password-error" : undefined
                            }
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />

                        {fieldErrors.password ? (
                            <p
                                id="password-error"
                                className="mt-1 text-sm text-red-700"
                                role="alert"
                            >
                                {fieldErrors.password}
                            </p>
                        ) : null}
                    </div>

                    {formError ? (
                        <div
                            className="rounded-md bg-red-50 p-3 text-sm text-red-800"
                            role="alert"
                        >
                            {formError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-blue-700 px-4 py-2.5 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </section>
        </main>
    );
}