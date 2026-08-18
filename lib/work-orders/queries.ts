import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    workOrderIdSchema,
    workOrderSearchSchema,
} from "@/lib/validation/work-order";

const WORK_ORDER_READ_ROLES = ["ADMIN", "DISPATCHER"] as const;

export async function listWorkOrders(
    rawQuery = "",
    rawStatus = "",
    rawPriority = "",
    rawTechnicianId = "",
    rawCustomerId = "",
) {
    await requireAnyRole(WORK_ORDER_READ_ROLES);

    const result = workOrderSearchSchema.safeParse({
        query: rawQuery,
        status: rawStatus,
        priority: rawPriority,
        technicianId: rawTechnicianId,
        customerId: rawCustomerId,
    });

    if (!result.success) {
        return {
            workOrders: [],
            error:
                result.error.issues[0]?.message ??
                "Invalid Work Order search.",
        };
    }

    const {
        query,
        status,
        priority,
        technicianId,
        customerId,
    } = result.data;

    try {
        const workOrders = await prisma.workOrder.findMany({
            where: {
                status: status || undefined,
                priority: priority || undefined,
                technicianId: technicianId || undefined,
                customerId: customerId || undefined,

                OR: query
                    ? [
                        {
                            title: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            customer: {
                                name: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            technician: {
                                is: {
                                    user: {
                                        name: {
                                            contains: query,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                        },
                    ]
                    : undefined,
            },

            orderBy: [
                {
                    scheduledStart: {
                        sort: "asc",
                        nulls: "last",
                    },
                },
                {
                    createdAt: "desc",
                },
            ],

            select: {
                id: true,
                title: true,
                priority: true,
                status: true,
                scheduledStart: true,
                scheduledEnd: true,
                createdAt: true,
                updatedAt: true,

                customer: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                    },
                },

                technician: {
                    select: {
                        id: true,
                        availability: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },

                createdBy: {
                    select: {
                        name: true,
                    },
                },

                _count: {
                    select: {
                        updates: true,
                    },
                },
            },

            take: 100,
        });

        return {
            workOrders,
            error: null,
        };
    } catch {
        return {
            workOrders: [],
            error: "Unable to load Work Orders.",
        };
    }
}

export async function getWorkOrderById(rawId: string) {
    await requireAnyRole(WORK_ORDER_READ_ROLES);

    const result = workOrderIdSchema.safeParse({
        id: rawId,
    });

    if (!result.success) {
        return {
            workOrder: null,
            error: "Invalid Work Order identifier.",
        };
    }

    try {
        const workOrder = await prisma.workOrder.findUnique({
            where: {
                id: result.data.id,
            },

            select: {
                id: true,
                title: true,
                description: true,
                priority: true,
                status: true,
                customerId: true,
                technicianId: true,
                scheduledStart: true,
                scheduledEnd: true,
                completionNotes: true,
                completedAt: true,
                createdAt: true,
                updatedAt: true,

                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        postcode: true,
                    },
                },

                technician: {
                    select: {
                        id: true,
                        skills: true,
                        availability: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },

                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },

                updates: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 100,
                    select: {
                        id: true,
                        previousStatus: true,
                        newStatus: true,
                        note: true,
                        createdAt: true,

                        author: {
                            select: {
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        if (!workOrder) {
            return {
                workOrder: null,
                error: "Work Order not found.",
            };
        }

        return {
            workOrder,
            error: null,
        };
    } catch {
        return {
            workOrder: null,
            error: "Unable to load the Work Order.",
        };
    }
}

export async function listWorkOrderCustomers() {
    await requireAnyRole(WORK_ORDER_READ_ROLES);

    try {
        const customers = await prisma.customer.findMany({
            orderBy: {
                name: "asc",
            },

            select: {
                id: true,
                name: true,
                city: true,
                postcode: true,
            },

            take: 500,
        });

        return {
            customers,
            error: null,
        };
    } catch {
        return {
            customers: [],
            error: "Unable to load Customer options.",
        };
    }
}

export async function listAssignableTechnicians() {
    await requireAnyRole(WORK_ORDER_READ_ROLES);

    try {
        const technicians =
            await prisma.technicianProfile.findMany({
                where: {
                    user: {
                        role: "TECHNICIAN",
                    },
                },

                orderBy: {
                    user: {
                        name: "asc",
                    },
                },

                select: {
                    id: true,
                    skills: true,
                    availability: true,

                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true,
                        },
                    },

                    _count: {
                        select: {
                            workOrders: {
                                where: {
                                    status: {
                                        in: ["ASSIGNED", "IN_PROGRESS"],
                                    },
                                },
                            },
                        },
                    },
                },

                take: 200,
            });

        return {
            technicians,
            error: null,
        };
    } catch {
        return {
            technicians: [],
            error: "Unable to load Technician options.",
        };
    }
}

export async function getWorkOrderFilterOptions() {
    await requireAnyRole(WORK_ORDER_READ_ROLES);

    try {
        const [customers, technicians] = await Promise.all([
            prisma.customer.findMany({
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                },
                take: 500,
            }),

            prisma.technicianProfile.findMany({
                where: {
                    user: {
                        role: "TECHNICIAN",
                    },
                },
                orderBy: {
                    user: {
                        name: "asc",
                    },
                },
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
                take: 200,
            }),
        ]);

        return {
            customers,
            technicians,
            error: null,
        };
    } catch {
        return {
            customers: [],
            technicians: [],
            error: "Unable to load Work Order filters.",
        };
    }
}