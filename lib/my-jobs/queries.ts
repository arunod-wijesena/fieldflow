import "server-only";

import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/permissions/server";
import { workOrderIdSchema } from "@/lib/validation/work-order";

export async function listMyJobs() {
    const session = await requireSession();

    try {
        const technicianProfile =
            await prisma.technicianProfile.findUnique({
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                },
            });

        if (!technicianProfile) {
            return {
                jobs: [],
                error: "Technician profile not found.",
            };
        }

        const jobs = await prisma.workOrder.findMany({
            where: {
                technicianId: technicianProfile.id,
                status: {
                    in: ["ASSIGNED", "IN_PROGRESS"],
                },
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
                description: true,
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
                        phone: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        postcode: true,
                    },
                },
                updates: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        note: true,
                        newStatus: true,
                        createdAt: true,
                    },
                },
            },
            take: 100,
        });

        return {
            jobs,
            error: null,
        };
    } catch {
        return {
            jobs: [],
            error: "Unable to load assigned jobs.",
        };
    }
}

export async function getMyJobById(rawId: string) {
    const session = await requireSession();

    const idResult = workOrderIdSchema.safeParse({
        id: rawId,
    });

    if (!idResult.success) {
        return {
            job: null,
            error: "Invalid Work Order identifier.",
        };
    }

    try {
        const technicianProfile =
            await prisma.technicianProfile.findUnique({
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                },
            });

        if (!technicianProfile) {
            return {
                job: null,
                error: "Technician profile not found.",
            };
        }

        const job = await prisma.workOrder.findFirst({
            where: {
                id: idResult.data.id,
                technicianId: technicianProfile.id,
            },
            select: {
                id: true,
                title: true,
                description: true,
                priority: true,
                status: true,
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
                        userId: true,
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

        if (!job) {
            return {
                job: null,
                error: "Assigned job not found.",
            };
        }

        return {
            job,
            error: null,
        };
    } catch {
        return {
            job: null,
            error: "Unable to load the assigned job.",
        };
    }
}