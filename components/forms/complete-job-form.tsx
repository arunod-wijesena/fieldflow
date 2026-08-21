"use client";

import { useActionState } from "react";
import {
    initialMyJobCompletionActionState,
    type MyJobCompletionActionState,
} from "@/lib/my-jobs/action-state";

type CompleteJobFormProps = {
    action: (
        previousState: MyJobCompletionActionState,
        formData: FormData,
    ) => Promise<MyJobCompletionActionState>;
};

export function CompleteJobForm({
    action,
}: CompleteJobFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialMyJobCompletionActionState,
    );

    return (
        <form action={formAction} className="space-y-4">
            {state.message ? (
                <div
                    className="rounded-md bg-red-50 p-3 text-sm text-red-800"
                    role="alert"
                >
                    {state.message}
                </div>
            ) : null}

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="completion-notes"
        >
          Completion notes <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="completion-notes"
          name="completionNotes"
          rows={5}
          required
          maxLength={5000}
          aria-invalid={Boolean(
            state.fieldErrors.completionNotes,
          )}
          aria-describedby={
            state.fieldErrors.completionNotes
              ? "completion-notes-error completion-notes-help"
              : "completion-notes-help"
          }
          placeholder="Describe the completed work and final outcome."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        <p
          id="completion-notes-help"
          className="mt-1 text-sm text-slate-500"
        >
          Completion notes are required and will be stored in the job
          history.
        </p>

        {state.fieldErrors.completionNotes ? (
          <p
            id="completion-notes-error"
            className="mt-1 text-sm text-red-700"
            role="alert"
          >
            {state.fieldErrors.completionNotes}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Completing job..." : "Complete Job"}
      </button>
    </form >
  );
}