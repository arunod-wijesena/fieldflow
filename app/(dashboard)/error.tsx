"use client";

import { useEffect } from "react";
import Link from "next/link";

type DashboardErrorProps = {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
};

export default function DashboardError({
    error,
    reset,
}: DashboardErrorProps) {
    useEffect(() => {
        console.error("FieldFlow protected-page error", {
            digest: error.digest,
        });
    }, [error]);

    return (
        <main className="flex min-h-[60vh] items-center justify-center p-4 sm:p-6">
            <section className="w-full max-w-xl rounded-xl bg-white p-6 text-center shadow-sm sm:p-8">
                <p className="text-sm font-medium text-blue-700">
                    FieldFlow
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                    Unable to display this page
                </h1>

                <p className="mt-3 text-slate-600">
                    An unexpected problem occurred while loading this FieldFlow
                    page. Try loading the page again.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={reset}
                        className="min-h-10 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                        Try again
                    </button>

                    <Link
                        href="/post-login"
                        className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                        Return to FieldFlow
                    </Link>
                </div>

                {error.digest ? (
                    <p className="mt-6 text-xs text-slate-400">
                        Reference: {error.digest}
                    </p>
                ) : null}
            </section>
        </main>
    );
}