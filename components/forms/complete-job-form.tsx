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
          htmlFor="completion-notes"
        >
          Completion notes <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="completion-notes"
          data-testid="completion-notes"
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
          className="w-full min-w-0 resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        <p
          id="completion-notes-help"
          className="mt-1 break-words text-sm text-slate-500"
        >
          Completion notes are required and will be stored in the job
          history.
        </p>

        {state.fieldErrors.completionNotes ? (
          <p
            id="completion-notes-error"
            className="mt-1 break-words text-sm text-red-700"
            role="alert"
          >
            {state.fieldErrors.completionNotes}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        data-testid="complete-job-submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-medium text-white outline-none hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Completing job..." : "Complete Job"}
      </button>
    </form>
  );
}