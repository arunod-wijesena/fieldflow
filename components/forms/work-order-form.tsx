"use client";

import { useActionState } from "react";
import {
  initialWorkOrderActionState,
  type WorkOrderActionState,
} from "@/lib/work-orders/action-state";
import { workOrderPriorityValues } from "@/lib/validation/work-order";

type CustomerOption = {
  id: string;
  name: string;
  city: string;
  postcode: string;
};

type TechnicianOption = {
  id: string;
  skills: string[];
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  user: {
    name: string;
    email: string;
    role: string;
  };
  _count: {
    workOrders: number;
  };
};

type WorkOrderFormValues = {
  title?: string;
  description?: string;
  priority?: (typeof workOrderPriorityValues)[number];
  customerId?: string;
  technicianId?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
};

type WorkOrderFormProps = {
  action: (
    previousState: WorkOrderActionState,
    formData: FormData,
  ) => Promise<WorkOrderActionState>;
  customers: CustomerOption[];
  technicians: TechnicianOption[];
  submitLabel: string;
  defaultValues?: WorkOrderFormValues;
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} satisfies Record<
  (typeof workOrderPriorityValues)[number],
  string
>;

const availabilityLabels = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  UNAVAILABLE: "Unavailable",
} satisfies Record<TechnicianOption["availability"], string>;

export function WorkOrderForm({
  action,
  customers,
  technicians,
  submitLabel,
  defaultValues,
}: WorkOrderFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialWorkOrderActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
      data-testid="work-order-form"
    >
      {state.message ? (
        <div
          className="break-words rounded-md bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <WorkOrderField
        id="title"
        label="Title"
        defaultValue={defaultValues?.title}
        error={state.fieldErrors.title}
        maxLength={160}
        required
      />

      <div className="min-w-0">
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="description"
        >
          Description <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          required
          maxLength={5000}
          defaultValue={defaultValues?.description ?? ""}
          aria-invalid={Boolean(
            state.fieldErrors.description,
          )}
          aria-describedby={
            state.fieldErrors.description
              ? "description-error"
              : undefined
          }
          className="w-full min-w-0 resize-y rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        {state.fieldErrors.description ? (
          <FieldError
            id="description-error"
            message={state.fieldErrors.description}
          />
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="priority"
          >
            Priority <span aria-hidden="true">*</span>
          </label>

          <select
            id="priority"
            name="priority"
            required
            defaultValue={defaultValues?.priority ?? "MEDIUM"}
            aria-invalid={Boolean(state.fieldErrors.priority)}
            aria-describedby={
              state.fieldErrors.priority
                ? "priority-error"
                : undefined
            }
            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {workOrderPriorityValues.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>

          {state.fieldErrors.priority ? (
            <FieldError
              id="priority-error"
              message={state.fieldErrors.priority}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="customerId"
          >
            Customer <span aria-hidden="true">*</span>
          </label>

          <select
            id="customerId"
            name="customerId"
            required
            defaultValue={defaultValues?.customerId ?? ""}
            aria-invalid={Boolean(
              state.fieldErrors.customerId,
            )}
            aria-describedby={
              state.fieldErrors.customerId
                ? "customerId-error"
                : undefined
            }
            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select a Customer
            </option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.city},{" "}
                {customer.postcode})
              </option>
            ))}
          </select>

          {state.fieldErrors.customerId ? (
            <FieldError
              id="customerId-error"
              message={state.fieldErrors.customerId}
            />
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <label
          className="mb-1 block text-sm font-medium text-slate-700"
          htmlFor="technicianId"
        >
          Technician
        </label>

        <select
          id="technicianId"
          name="technicianId"
          defaultValue={defaultValues?.technicianId ?? ""}
          aria-invalid={Boolean(
            state.fieldErrors.technicianId,
          )}
          aria-describedby={
            state.fieldErrors.technicianId
              ? "technicianId-error technician-help"
              : "technician-help"
          }
          className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Leave unassigned</option>

          {technicians.map((technician) => (
            <option
              key={technician.id}
              value={technician.id}
              disabled={
                technician.availability === "UNAVAILABLE"
              }
            >
              {technician.user.name} ·{" "}
              {availabilityLabels[technician.availability]} ·{" "}
              {technician._count.workOrders} active job(s)
            </option>
          ))}
        </select>

        <p
          id="technician-help"
          className="mt-1 break-words text-sm text-slate-500"
        >
          Unavailable Technicians cannot be assigned. Busy
          Technicians remain selectable with their active workload
          shown.
        </p>

        {state.fieldErrors.technicianId ? (
          <FieldError
            id="technicianId-error"
            message={state.fieldErrors.technicianId}
          />
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WorkOrderField
          id="scheduledStart"
          label="Scheduled start"
          type="datetime-local"
          defaultValue={defaultValues?.scheduledStart}
          error={state.fieldErrors.scheduledStart}
        />

        <WorkOrderField
          id="scheduledEnd"
          label="Scheduled end"
          type="datetime-local"
          defaultValue={defaultValues?.scheduledEnd}
          error={state.fieldErrors.scheduledEnd}
        />
      </div>

      <button
        type="submit"
        data-testid="work-order-submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form >
  );
}

type WorkOrderFieldProps = {
  id: "title" | "scheduledStart" | "scheduledEnd";
  label: string;
  type?: "text" | "datetime-local";
  defaultValue?: string | null;
  error?: string;
  maxLength?: number;
  required?: boolean;
};

function WorkOrderField({
  id,
  label,
  type = "text",
  defaultValue,
  error,
  maxLength,
  required = false,
}: WorkOrderFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="min-w-0">
      <label
        className="mb-1 block text-sm font-medium text-slate-700"
        htmlFor={id}
      >
        {label}
        {required ? (
          <span aria-hidden="true"> *</span>
        ) : null}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />

      {error ? (
        <FieldError id={errorId} message={error} />
      ) : null}
    </div>
  );
}

type FieldErrorProps = {
  id: string;
  message?: string;
};

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-1 break-words text-sm text-red-700"
      role="alert"
    >
      {message}
    </p>
  );
}