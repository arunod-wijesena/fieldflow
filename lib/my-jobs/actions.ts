"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MyJobActionState } from "@/lib/my-jobs/action-state";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/server";
import { workOrderIdSchema } from "@/lib/validation/work-order";

export async function startMyJob(
    workOrderId: string,
    _previousState: MyJobActionState,
    _formData: FormData,
): Promise<MyJobActionState> {
    void _previousState;
    void _formData;

    const session = await requireRole("TECHNICIAN");

    const idResult = workOrderIdSchema.safeParse({
        id: workOrderId,
    });

    if (!idResult.success) {
        return {
            status: "error",
            message: "Invalid assigned job identifier.",
        };
    }

    try {
        await prisma.$transaction(async (transaction) => {
            const technicianProfile =
                await transaction.technicianProfile.findUnique({
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        id: true,
                        user: {
                            select: {
                                role: true,
                            },
                        },
                    },
                });

            if (!technicianProfile) {
                throw new MyJobOperationError(
                    "Technician profile not found.",
                );
            }

            if (technicianProfile.user.role !== "TECHNICIAN") {
                throw new MyJobOperationError(
                    "The signed-in account is not a valid Technician account.",
                );
            }

            const workOrder = await transaction.workOrder.findFirst({
                where: {
                    id: idResult.data.id,
                    technicianId: technicianProfile.id,
                },
                select: {
                    id: true,
                    status: true,
                    technicianId: true,
                },
            });

            if (!workOrder) {
                throw new MyJobOperationError(
                    "Assigned job not found.",
                );
            }

            if (workOrder.status !== "ASSIGNED") {
                if (workOrder.status === "IN_PROGRESS") {
                    throw new MyJobOperationError(
                        "This job is already in progress.",
                    );
                }

                throw new MyJobOperationError(
                    "Only an assigned job can be started.",
                );
            }

            await transaction.workOrder.update({
                where: {
                    id: workOrder.id,
                },
                data: {
                    status: "IN_PROGRESS",
                },
            });

            await transaction.technicianProfile.update({
                where: {
                    id: technicianProfile.id,
                },
                data: {
                    availability: "BUSY",
                },
            });

            await transaction.workOrderUpdate.create({
                data: {
                    workOrderId: workOrder.id,
                    authorId: session.user.id,
                    previousStatus: "ASSIGNED",
                    newStatus: "IN_PROGRESS",
                    note: "Technician started work.",
                },
            });
        });
    } catch (error) {
        if (error instanceof MyJobOperationError) {
            return {
                status: "error",
                message: error.message,
            };
        }

        return {
            status: "error",
            message: "Unable to start this job. Please try again.",
        };
    }

    revalidatePath("/my-jobs");
    revalidatePath(`/my-jobs/${idResult.data.id}`);
    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${idResult.data.id}`);
    revalidatePath("/technicians");

    redirect(`/my-jobs/${idResult.data.id}`);
}

class MyJobOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MyJobOperationError";
    }
}