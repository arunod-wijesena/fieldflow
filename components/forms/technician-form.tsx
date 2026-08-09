"use client";

import { useActionState } from "react";
import {
    initialTechnicianActionState,
    type TechnicianActionState,
} from "@/lib/technicians/action-state";
import { technicianAvailabilityValues } from "@/lib/validation/technician";

type EligibleTechnicianAccount = {
    id: string;
    name: string;
    email: string;
};

type TechnicianFormValues = {
    skills?: string[];
    availability?: (typeof technicianAvailabilityValues)[number];
};

type TechnicianFormProps = {
    action: (
        previousState: TechnicianActionState,
        formData: FormData,
    ) => Promise<TechnicianActionState>;
    submitLabel: string;
    accounts?: EligibleTechnicianAccount[];
    defaultValues?: TechnicianFormValues;
    linkedAccount?: {
        name: string;
        email: string;
    };
};

const availabilityLabels = {
    AVAILABLE: "Available",
    BUSY: "Busy",
    UNAVAILABLE: "Unavailable",
} satisfies Record<
    (typeof technicianAvailabilityValues)[number],
    string
>;

export function TechnicianForm({
    action,
    submitLabel,
    accounts,
    defaultValues,
    linkedAccount,
}: TechnicianFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialTechnicianActionState,
    );

    const isCreateMode = Boolean(accounts);

    return (
        <form action={formAction} className="space-y-6">
            {state.message ? (
                <div
                    className="rounded-md bg-red-50 p-3 text-sm text-red-800"
                    role="alert"
                >
                    {state.message}
                </div>
            ) : null}

            {isCreateMode ? (
                <div>
                    <label
                        className="mb-1 block text-sm font-medium text-slate-700"
                        htmlFor="userId"
                    >
                        Technician account <span aria-hidden="true">*</span>
                    </label>

                    <select
                        id="userId"
                        name="userId"
                        required
                        defaultValue=""
                        aria-invalid={Boolean(state.fieldErrors.userId)}
                        aria-describedby={
                            state.fieldErrors.userId ? "userId-error" : undefined
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="" disabled>
                            Select a Technician account
                        </option>

                        {accounts?.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({account.email})
                            </option>
                        ))}
                    </select>

                    {state.fieldErrors.userId ? (
                        <p
                            id="userId-error"
                            className="mt-1 text-sm text-red-700"
                            role="alert"
                        >
                            {state.fieldErrors.userId}
                        </p>
                    ) : null}
                </div>
            ) : linkedAccount ? (
                <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                        Linked account
                    </p>

                    <p className="mt-1 text-slate-900">{linkedAccount.name}</p>
                    <p className="text-sm text-slate-600">{linkedAccount.email}</p>

                    <p className="mt-2 text-xs text-slate-500">
                        The linked account cannot be changed after profile creation.
                    </p>
                </div>
            ) : null}

            <div>
                <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="skills"
                >
                    Skills
                </label>

                <textarea
                    id="skills"
                    name="skills"
                    rows={4}
                    defaultValue={defaultValues?.skills?.join(", ") ?? ""}
                    aria-invalid={Boolean(state.fieldErrors.skills)}
                    aria-describedby={
                        state.fieldErrors.skills
                            ? "skills-error skills-help"
                            : "skills-help"
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <p id="skills-help" className="mt-1 text-sm text-slate-500">
                    Separate skills with commas, for example: HVAC, Electrical,
                    Plumbing.
                </p>

                {state.fieldErrors.skills ? (
                    <p
                        id="skills-error"
                        className="mt-1 text-sm text-red-700"
                        role="alert"
                    >
                        {state.fieldErrors.skills}
                    </p>
                ) : null}
            </div>

            <div>
                <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="availability"
                >
                    Availability <span aria-hidden="true">*</span>
                </label>

                <select
                    id="availability"
                    name="availability"
                    required
                    defaultValue={defaultValues?.availability ?? "AVAILABLE"}
                    aria-invalid={Boolean(state.fieldErrors.availability)}
                    aria-describedby={
                        state.fieldErrors.availability
                            ? "availability-error"
                            : undefined
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                    {technicianAvailabilityValues.map((value) => (
                        <option key={value} value={value}>
                            {availabilityLabels[value]}
                        </option>
                    ))}
                </select>

                {state.fieldErrors.availability ? (
                    <p
                        id="availability-error"
                        className="mt-1 text-sm text-red-700"
                        role="alert"
                    >
                        {state.fieldErrors.availability}
                    </p>
                ) : null}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}