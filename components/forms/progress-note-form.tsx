"use client";

import { useActionState } from "react";
import {
    initialMyJobProgressActionState,
    type MyJobProgressActionState,
} from "@/lib/my-jobs/action-state";

type ProgressNoteFormProps = {
    action: (
        previousState: MyJobProgressActionState,
        formData: FormData,
    ) => Promise<MyJobProgressActionState>;
};

export function ProgressNoteForm({
    action,
}: ProgressNoteFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialMyJobProgressActionState,
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
        ) : null
    }

      <div>
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="progress-note"
        >
          Progress note <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="progress-note"
          name="note"
          rows={4}
          required
          maxLength={2000}
          aria-invalid={Boolean(state.fieldErrors.note)}
          aria-describedby={
            state.fieldErrors.note
              ? "progress-note-error progress-note-help"
              : "progress-note-help"
          }
          placeholder="Describe the work completed or current findings."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
        />

        <p
          id="progress-note-help"
          className="mt-1 text-sm text-slate-500"
        >
          The note will be added to the job’s timestamped history.
        </p>

        {state.fieldErrors.note ? (
          <p
            id="progress-note-error"
            className="mt-1 text-sm text-red-700"
            role="alert"
          >
            {state.fieldErrors.note}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-amber-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving note..." : "Add Progress Note"}
      </button>
    </form >
  );
}