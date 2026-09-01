"use client";

import { useActionState } from "react";
import {
    initialMyJobActionState,
    type MyJobActionState,
} from "@/lib/my-jobs/action-state";

type StartWorkFormProps = {
    action: (
        previousState: MyJobActionState,
        formData: FormData,
    ) => Promise<MyJobActionState>;
};

export function StartWorkForm({
    action,
}: StartWorkFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialMyJobActionState,
    );

    return (
        <form action={formAction} className="min-w-0 space-y-4">
            {state.message ? (
                <div
                    className="break-words rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                    role="alert"
                >
                    {state.message}
                </div>
            ) : null}

            <button
                type="submit"
                data-testid="start-work-submit"
                disabled={isPending}
                className="min-h-11 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {isPending ? "Starting work..." : "Start Work"}
            </button>
        </form>
    );
}