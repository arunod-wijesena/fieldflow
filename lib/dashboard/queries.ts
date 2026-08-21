import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";

const DASHBOARD_ROLES = ["ADMIN", "DISPATCHER"] as const;

export async function getDashboardData() {
    await requireAnyRole(DASHBOARD_ROLES);

    try {
        const [
            totalWorkOrders,
            workOrdersByStatus,
            techniciansByAvailability,
            recentWorkOrders,
        ] = await Promise.all([
            prisma.workOrder.count(),

            prisma.workOrder.groupBy({
                by: ["status"],
                _count: {
                    _all: true,
                },
            }),

            prisma.technicianProfile.groupBy({
                by: ["availability"],
                _count: {
                    _all: true,
                },
            }),

            prisma.workOrder.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
                take: 8,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    scheduledStart: true,
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
                            user: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        const statusCounts = {
            UNASSIGNED: 0,
            ASSIGNED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };

        for (const result of workOrdersByStatus) {
            statusCounts[result.status] = result._count._all;
        }

        const availabilityCounts = {
            AVAILABLE: 0,
            BUSY: 0,
            UNAVAILABLE: 0,
        };

        for (const result of techniciansByAvailability) {
            availabilityCounts[result.availability] =
                result._count._all;
        }

        return {
            data: {
                totalWorkOrders,
                statusCounts,
                availabilityCounts,
                recentWorkOrders,
            },
            error: null,
        };
    } catch {
        return {
            data: null,
            error: "Unable to load Dashboard information.",
        };
    }
}