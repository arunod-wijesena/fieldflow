import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    technicianIdSchema,
    technicianSearchSchema,
} from "@/lib/validation/technician";

const TECHNICIAN_READ_ROLES = ["ADMIN", "DISPATCHER"] as const;

export async function listTechnicians(
    rawQuery = "",
    rawAvailability = "",
) {
    await requireAnyRole(TECHNICIAN_READ_ROLES);

    const result = technicianSearchSchema.safeParse({
        query: rawQuery,
        availability: rawAvailability,
    });

    if (!result.success) {
        return {
            technicians: [],
            error:
                result.error.issues[0]?.message ??
                "Invalid technician search.",
        };
    }

    const { query, availability } = result.data;

    try {
        const technicians = await prisma.technicianProfile.findMany({
            where: {
                availability: availability || undefined,
                OR: query
                    ? [
                        {
                            user: {
                                name: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            user: {
                                email: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            skills: {
                                has: query,
                            },
                        },
                    ]
                    : undefined,
            },
            orderBy: {
                user: {
                    name: "asc",
                },
            },
            select: {
                id: true,
                userId: true,
                skills: true,
                availability: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        workOrders: true,
                    },
                },
            },
            take: 100,
        });

        return {
            technicians,
            error: null,
        };
    } catch {
        return {
            technicians: [],
            error: "Unable to load technicians.",
        };
    }
}

export async function getTechnicianById(rawId: string) {
    await requireAnyRole(TECHNICIAN_READ_ROLES);

    const result = technicianIdSchema.safeParse({
        id: rawId,
    });

    if (!result.success) {
        return {
            technician: null,
            error: "Invalid technician profile identifier.",
        };
    }

    try {
        const technician =
            await prisma.technicianProfile.findUnique({
                where: {
                    id: result.data.id,
                },
                select: {
                    id: true,
                    userId: true,
                    skills: true,
                    availability: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    workOrders: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 10,
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            priority: true,
                            scheduledStart: true,
                            customer: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            workOrders: true,
                        },
                    },
                },
            });

        if (!technician) {
            return {
                technician: null,
                error: "Technician profile not found.",
            };
        }

        return {
            technician,
            error: null,
        };
    } catch {
        return {
            technician: null,
            error: "Unable to load the technician profile.",
        };
    }
}

export async function listEligibleTechnicianAccounts() {
    await requireAnyRole(TECHNICIAN_READ_ROLES);

    try {
        const users = await prisma.user.findMany({
            where: {
                role: "TECHNICIAN",
                technicianProfile: null,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 100,
        });

        return {
            users,
            error: null,
        };
    } catch {
        return {
            users: [],
            error: "Unable to load eligible technician accounts.",
        };
    }
}