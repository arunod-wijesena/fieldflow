import { z } from "zod";

const optionalContactField = z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional();

export const customerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Customer name is required.")
        .max(120, "Customer name must not exceed 120 characters."),

    email: optionalContactField.pipe(
        z
            .string()
            .email("Enter a valid email address.")
            .max(254, "Email must not exceed 254 characters.")
            .optional(),
    ),

    phone: optionalContactField.pipe(
        z
            .string()
            .min(7, "Phone number must contain at least 7 characters.")
            .max(30, "Phone number must not exceed 30 characters.")
            .regex(
                /^[0-9+().\-\s]+$/,
                "Phone number contains unsupported characters.",
            )
            .optional(),
    ),

    addressLine1: z
        .string()
        .trim()
        .min(1, "Address line 1 is required.")
        .max(160, "Address line 1 must not exceed 160 characters."),

    addressLine2: z
        .string()
        .trim()
        .max(160, "Address line 2 must not exceed 160 characters.")
        .transform((value) => (value === "" ? undefined : value))
        .optional(),

    city: z
        .string()
        .trim()
        .min(1, "City is required.")
        .max(100, "City must not exceed 100 characters."),

    postcode: z
        .string()
        .trim()
        .min(1, "Postcode is required.")
        .max(20, "Postcode must not exceed 20 characters."),
});

export const customerSearchSchema = z.object({
    query: z
        .string()
        .trim()
        .max(100, "Search must not exceed 100 characters.")
        .default(""),
});

export const customerIdSchema = z.object({
    id: z.string().cuid("Invalid customer identifier."),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;