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

export function StartWorkForm({ action }: StartWorkFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialMyJobActionState,
    );

    return (
        <form action={formAction}>
            {state.message ? (
                <div
                    className="rounded-md bg-red-50 p-3 text-sm text-red-800"
                    role="alert"
                >
                    {state.message}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? "Starting work..." : "Start Work"}
            </button>
        </form>
    );
}