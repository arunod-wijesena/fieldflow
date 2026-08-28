"use client";

import { useActionState } from "react";
import {
    initialWorkOrderStatusActionState,
    type WorkOrderStatusActionState,
} from "@/lib/work-orders/action-state";

type WorkOrderCancelFormProps = {
    action: (
        previousState: WorkOrderStatusActionState,
        formData: FormData,
    ) => Promise<WorkOrderStatusActionState>;
};

export function WorkOrderCancelForm({
    action,
}: WorkOrderCancelFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialWorkOrderStatusActionState,
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

            <div className="min-w-0">
                <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="note"
                >
                    Cancellation note
                </label>

                <textarea
                    id="note"
                    name="note"
                    rows={3}
                    maxLength={2000}
                    aria-invalid={Boolean(state.fieldErrors.note)}
                    aria-describedby={
                        state.fieldErrors.note
                            ? "cancel-note-error cancel-note-help"
                            : "cancel-note-help"
                    }
                    className="w-full min-w-0 resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                    placeholder="Optional reason for cancellation"
                />

                <p
                    id="cancel-note-help"
                    className="mt-1 break-words text-sm text-slate-500"
                >
                    This note will be stored in the Work Order history.
                </p>

                {state.fieldErrors.note ? (
                    <p
                        id="cancel-note-error"
                        className="mt-1 break-words text-sm text-red-700"
                        role="alert"
                    >
                        {state.fieldErrors.note}
                    </p>
                ) : null}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="min-h-11 w-full rounded-md bg-red-700 px-4 py-2.5 text-sm font-medium text-white outline-none hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {isPending ? "Cancelling..." : "Cancel Work Order"}
            </button>
        </form>
    );
}