"use client";

import { useActionState } from "react";
import {
    initialCustomerActionState,
    type CustomerActionState,
} from "@/lib/customers/action-state";

type CustomerFormValues = {
    name?: string;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    postcode?: string;
};

type CustomerFormProps = {
    action: (
        previousState: CustomerActionState,
        formData: FormData,
    ) => Promise<CustomerActionState>;
    submitLabel: string;
    defaultValues?: CustomerFormValues;
};

export function CustomerForm({
    action,
    submitLabel,
    defaultValues,
}: CustomerFormProps) {
    const [state, formAction, isPending] = useActionState(
        action,
        initialCustomerActionState,
    );

    return (
        <form action={formAction} className="space-y-6">
            {state.message ? (
                <div
                    className="break-words rounded-md bg-red-50 p-3 text-sm text-red-800"
                    role="alert"
                >
                    {state.message}
                </div>
            ) : null}

            <CustomerField
                id="name"
                label="Customer name"
                defaultValue={defaultValues?.name}
                error={state.fieldErrors.name}
                autoComplete="organization"
                required
            />

            <div className="grid gap-6 md:grid-cols-2">
                <CustomerField
                    id="email"
                    label="Email"
                    type="email"
                    defaultValue={defaultValues?.email ?? ""}
                    error={state.fieldErrors.email}
                    autoComplete="email"
                />

                <CustomerField
                    id="phone"
                    label="Phone"
                    type="tel"
                    defaultValue={defaultValues?.phone ?? ""}
                    error={state.fieldErrors.phone}
                    autoComplete="tel"
                />
            </div>

            <CustomerField
                id="addressLine1"
                label="Address line 1"
                defaultValue={defaultValues?.addressLine1}
                error={state.fieldErrors.addressLine1}
                autoComplete="address-line1"
                required
            />

            <CustomerField
                id="addressLine2"
                label="Address line 2"
                defaultValue={defaultValues?.addressLine2 ?? ""}
                error={state.fieldErrors.addressLine2}
                autoComplete="address-line2"
            />

            <div className="grid gap-6 md:grid-cols-2">
                <CustomerField
                    id="city"
                    label="City"
                    defaultValue={defaultValues?.city}
                    error={state.fieldErrors.city}
                    autoComplete="address-level2"
                    required
                />

                <CustomerField
                    id="postcode"
                    label="Postcode"
                    defaultValue={defaultValues?.postcode}
                    error={state.fieldErrors.postcode}
                    autoComplete="postal-code"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="min-h-11 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {isPending ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}

type CustomerFieldProps = {
    id: keyof CustomerFormValues;
    label: string;
    type?: "text" | "email" | "tel";
    defaultValue?: string | null;
    error?: string;
    autoComplete?: string;
    required?: boolean;
};

function CustomerField({
    id,
    label,
    type = "text",
    defaultValue,
    error,
    autoComplete,
    required = false,
}: CustomerFieldProps) {
    const errorId = `${id}-error`;

    return (
        <div className="min-w-0">
            <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor={id}
            >
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
            </label>

            <input
                id={id}
                name={id}
                type={type}
                defaultValue={defaultValue ?? ""}
                autoComplete={autoComplete}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {error ? (
                <p
                    id={errorId}
                    className="mt-1 break-words text-sm text-red-700"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}