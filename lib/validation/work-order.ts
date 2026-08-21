import { z } from "zod";

export const workOrderStatusValues = [
    "UNASSIGNED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
] as const;

export const workOrderPriorityValues = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
] as const;

export const workOrderStatusSchema = z.enum(
    workOrderStatusValues,
);

export const workOrderPrioritySchema = z.enum(
    workOrderPriorityValues,
);

function optionalTrimmedString(maximumLength: number, message: string) {
    return z
        .string()
        .trim()
        .max(maximumLength, message)
        .transform((value) => (value === "" ? undefined : value));
}

const optionalDateTimeSchema = z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .refine(
        (value) =>
            value === undefined ||
            !Number.isNaN(new Date(value).getTime()),
        "Enter a valid date and time.",
    );

export const workOrderFormSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Work Order title is required.")
            .max(160, "Title must not exceed 160 characters."),

        description: z
            .string()
            .trim()
            .min(1, "Description is required.")
            .max(5_000, "Description must not exceed 5,000 characters."),

        priority: workOrderPrioritySchema,

        customerId: z
            .string()
            .trim()
            .min(1, "Customer is required."),

        technicianId: optionalTrimmedString(
            100,
            "Invalid Technician identifier.",
        ),

        scheduledStart: optionalDateTimeSchema,
        scheduledEnd: optionalDateTimeSchema,
    })
    .superRefine((data, context) => {
        const start = data.scheduledStart
            ? new Date(data.scheduledStart)
            : null;

        const end = data.scheduledEnd
            ? new Date(data.scheduledEnd)
            : null;

        if (end && !start) {
            context.addIssue({
                code: "custom",
                path: ["scheduledStart"],
                message:
                    "Scheduled start is required when scheduled end is provided.",
            });
        }

        if (start && end && end <= start) {
            context.addIssue({
                code: "custom",
                path: ["scheduledEnd"],
                message:
                    "Scheduled end must be later than scheduled start.",
            });
        }
    });

export const workOrderInputSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        priority: workOrderPrioritySchema,
        customerId: z.string(),
        technicianId: z.string().optional(),
        scheduledStart: z.date().optional(),
        scheduledEnd: z.date().optional(),
    })
    .superRefine((data, context) => {
        if (
            data.scheduledStart &&
            data.scheduledEnd &&
            data.scheduledEnd <= data.scheduledStart
        ) {
            context.addIssue({
                code: "custom",
                path: ["scheduledEnd"],
                message:
                    "Scheduled end must be later than scheduled start.",
            });
        }
    });

export const workOrderSearchSchema = z.object({
    query: z
        .string()
        .trim()
        .max(100, "Search must not exceed 100 characters.")
        .default(""),

    status: z
        .union([workOrderStatusSchema, z.literal("")])
        .default(""),

    priority: z
        .union([workOrderPrioritySchema, z.literal("")])
        .default(""),

    technicianId: z
        .string()
        .trim()
        .max(100, "Invalid Technician filter.")
        .default(""),

    customerId: z
        .string()
        .trim()
        .max(100, "Invalid Customer filter.")
        .default(""),
});

export const workOrderIdSchema = z.object({
    id: z.string().cuid("Invalid Work Order identifier."),
});

export const workOrderStatusUpdateSchema = z.object({
    workOrderId: z.string().cuid(
        "Invalid Work Order identifier.",
    ),

    newStatus: workOrderStatusSchema,

    note: optionalTrimmedString(
        2_000,
        "Status note must not exceed 2,000 characters.",
    ),
});

export const workOrderProgressNoteSchema = z.object({
    workOrderId: z.string().cuid(
        "Invalid Work Order identifier.",
    ),

    note: z
        .string()
        .trim()
        .min(1, "Progress note is required.")
        .max(2_000, "Progress note must not exceed 2,000 characters."),
});

export type WorkOrderFormInput = z.infer<
    typeof workOrderFormSchema
>;

export type WorkOrderInput = z.infer<
    typeof workOrderInputSchema
>;

export type WorkOrderSearchInput = z.infer<
    typeof workOrderSearchSchema
>;