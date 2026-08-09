"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    customerIdSchema,
    customerSchema,
} from "@/lib/validation/customer";

const CUSTOMER_WRITE_ROLES = ["ADMIN", "DISPATCHER"] as const;

type CustomerField =
    | "name"
    | "email"
    | "phone"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "postcode";

export type CustomerActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: Partial<Record<CustomerField, string>>;
};

export const initialCustomerActionState: CustomerActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};

function readString(formData: FormData, field: CustomerField) {
    const value = formData.get(field);

    return typeof value === "string" ? value : "";
}

function parseCustomerFormData(formData: FormData) {
    return customerSchema.safeParse({
        name: readString(formData, "name"),
        email: readString(formData, "email"),
        phone: readString(formData, "phone"),
        addressLine1: readString(formData, "addressLine1"),
        addressLine2: readString(formData, "addressLine2"),
        city: readString(formData, "city"),
        postcode: readString(formData, "postcode"),
    });
}

function getFieldErrors(
    issues: {
        path: PropertyKey[];
        message: string;
    }[],
) {
    const fieldErrors: CustomerActionState["fieldErrors"] = {};

    for (const issue of issues) {
        const field = issue.path[0];

        if (
            typeof field === "string" &&
            [
                "name",
                "email",
                "phone",
                "addressLine1",
                "addressLine2",
                "city",
                "postcode",
            ].includes(field) &&
            !fieldErrors[field as CustomerField]
        ) {
            fieldErrors[field as CustomerField] = issue.message;
        }
    }

    return fieldErrors;
}

export async function createCustomer(
    _previousState: CustomerActionState,
    formData: FormData,
): Promise<CustomerActionState> {
    await requireAnyRole(CUSTOMER_WRITE_ROLES);

    const result = parseCustomerFormData(formData);

    if (!result.success) {
        return {
            status: "error",
            message: "Check the highlighted customer details.",
            fieldErrors: getFieldErrors(result.error.issues),
        };
    }

    let customerId: string;

    try {
        const customer = await prisma.customer.create({
            data: {
                name: result.data.name,
                email: result.data.email ?? null,
                phone: result.data.phone ?? null,
                addressLine1: result.data.addressLine1,
                addressLine2: result.data.addressLine2 ?? null,
                city: result.data.city,
                postcode: result.data.postcode,
            },
            select: {
                id: true,
            },
        });

        customerId = customer.id;
    } catch {
        return {
            status: "error",
            message: "Unable to create the customer. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/customers");
    redirect(`/customers/${customerId}`);
}

export async function updateCustomer(
    customerId: string,
    _previousState: CustomerActionState,
    formData: FormData,
): Promise<CustomerActionState> {
    await requireAnyRole(CUSTOMER_WRITE_ROLES);

    const idResult = customerIdSchema.safeParse({
        id: customerId,
    });

    if (!idResult.success) {
        return {
            status: "error",
            message: "Invalid customer identifier.",
            fieldErrors: {},
        };
    }

    const result = parseCustomerFormData(formData);

    if (!result.success) {
        return {
            status: "error",
            message: "Check the highlighted customer details.",
            fieldErrors: getFieldErrors(result.error.issues),
        };
    }

    try {
        const existingCustomer = await prisma.customer.findUnique({
            where: {
                id: idResult.data.id,
            },
            select: {
                id: true,
            },
        });

        if (!existingCustomer) {
            return {
                status: "error",
                message: "Customer not found.",
                fieldErrors: {},
            };
        }

        await prisma.customer.update({
            where: {
                id: idResult.data.id,
            },
            data: {
                name: result.data.name,
                email: result.data.email ?? null,
                phone: result.data.phone ?? null,
                addressLine1: result.data.addressLine1,
                addressLine2: result.data.addressLine2 ?? null,
                city: result.data.city,
                postcode: result.data.postcode,
            },
        });
    } catch {
        return {
            status: "error",
            message: "Unable to update the customer. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/customers");
    revalidatePath(`/customers/${idResult.data.id}`);
    redirect(`/customers/${idResult.data.id}`);
}