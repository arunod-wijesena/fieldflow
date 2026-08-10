import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    customerIdSchema,
    customerSearchSchema,
} from "@/lib/validation/customer";

const CUSTOMER_READ_ROLES = ["ADMIN", "DISPATCHER"] as const;

export async function listCustomers(rawQuery = "") {
    await requireAnyRole(CUSTOMER_READ_ROLES);

    const result = customerSearchSchema.safeParse({
        query: rawQuery,
    });

    if (!result.success) {
        return {
            customers: [],
            error: result.error.issues[0]?.message ?? "Invalid customer search.",
        };
    }

    const query = result.data.query;

    try {
        const customers = await prisma.customer.findMany({
            where: query
                ? {
                    OR: [
                        {
                            name: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            phone: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            city: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : undefined,
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                postcode: true,
                createdAt: true,
                updatedAt: true,
            },
            take: 100,
        });

        return {
            customers,
            error: null,
        };
    } catch {
        return {
            customers: [],
            error: "Unable to load customers.",
        };
    }
}

export async function getCustomerById(rawId: string) {
    await requireAnyRole(CUSTOMER_READ_ROLES);

    const result = customerIdSchema.safeParse({
        id: rawId,
    });

    if (!result.success) {
        return {
            customer: null,
            error: "Invalid customer identifier.",
        };
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: result.data.id,
            },
        });

        if (!customer) {
            return {
                customer: null,
                error: "Customer not found.",
            };
        }

        return {
            customer,
            error: null,
        };
    } catch {
        return {
            customer: null,
            error: "Unable to load the customer.",
        };
    }
}