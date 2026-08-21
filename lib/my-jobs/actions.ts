"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MyJobActionState, MyJobCompletionActionState, MyJobProgressActionState } from "@/lib/my-jobs/action-state";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions/server";
import { workOrderCompletionSchema, workOrderIdSchema, workOrderProgressNoteSchema } from "@/lib/validation/work-order";

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

export async function addMyJobProgressNote(
    workOrderId: string,
    _previousState: MyJobProgressActionState,
    formData: FormData,
): Promise<MyJobProgressActionState> {
    void _previousState;

    const session = await requireRole("TECHNICIAN");
    const rawNote = formData.get("note");

    const result = workOrderProgressNoteSchema.safeParse({
        workOrderId,
        note: typeof rawNote === "string" ? rawNote : "",
    });

    if (!result.success) {
        return {
            status: "error",
            message: "Check the progress note.",
            fieldErrors: {
                note:
                    result.error.issues.find(
                        (issue) => issue.path[0] === "note",
                    )?.message ?? "Enter a valid progress note.",
            },
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
                    id: result.data.workOrderId,
                    technicianId: technicianProfile.id,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!workOrder) {
                throw new MyJobOperationError(
                    "Assigned job not found.",
                );
            }

            if (workOrder.status !== "IN_PROGRESS") {
                throw new MyJobOperationError(
                    "Progress notes can only be added to a job in progress.",
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

            await transaction.workOrderUpdate.create({
                data: {
                    workOrderId: workOrder.id,
                    authorId: session.user.id,
                    previousStatus: "IN_PROGRESS",
                    newStatus: "IN_PROGRESS",
                    note: result.data.note,
                },
            });
        });
    } catch (error) {
        if (error instanceof MyJobOperationError) {
            return {
                status: "error",
                message: error.message,
                fieldErrors: {},
            };
        }

        return {
            status: "error",
            message: "Unable to save the progress note. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/my-jobs");
    revalidatePath(`/my-jobs/${result.data.workOrderId}`);
    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${result.data.workOrderId}`);

    redirect(`/my-jobs/${result.data.workOrderId}`);
}

export async function completeMyJob(
    workOrderId: string,
    _previousState: MyJobCompletionActionState,
    formData: FormData,
): Promise<MyJobCompletionActionState> {
    void _previousState;

    const session = await requireRole("TECHNICIAN");
    const rawCompletionNotes = formData.get("completionNotes");

    const result = workOrderCompletionSchema.safeParse({
        workOrderId,
        completionNotes:
            typeof rawCompletionNotes === "string"
                ? rawCompletionNotes
                : "",
    });

    if (!result.success) {
        return {
            status: "error",
            message: "Check the completion details.",
            fieldErrors: {
                completionNotes:
                    result.error.issues.find(
                        (issue) => issue.path[0] === "completionNotes",
                    )?.message ?? "Enter valid completion notes.",
            },
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
                    id: result.data.workOrderId,
                    technicianId: technicianProfile.id,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!workOrder) {
                throw new MyJobOperationError(
                    "Assigned job not found.",
                );
            }

            if (workOrder.status === "COMPLETED") {
                throw new MyJobOperationError(
                    "This job is already completed.",
                );
            }

            if (workOrder.status !== "IN_PROGRESS") {
                throw new MyJobOperationError(
                    "Only a job in progress can be completed.",
                );
            }

            const completedAt = new Date();

            await transaction.workOrder.update({
                where: {
                    id: workOrder.id,
                },
                data: {
                    status: "COMPLETED",
                    completionNotes: result.data.completionNotes,
                    completedAt,
                },
            });

            await transaction.workOrderUpdate.create({
                data: {
                    workOrderId: workOrder.id,
                    authorId: session.user.id,
                    previousStatus: "IN_PROGRESS",
                    newStatus: "COMPLETED",
                    note: result.data.completionNotes,
                },
            });

            const otherInProgressJobs =
                await transaction.workOrder.count({
                    where: {
                        technicianId: technicianProfile.id,
                        status: "IN_PROGRESS",
                        id: {
                            not: workOrder.id,
                        },
                    },
                });

            await transaction.technicianProfile.update({
                where: {
                    id: technicianProfile.id,
                },
                data: {
                    availability:
                        otherInProgressJobs > 0 ? "BUSY" : "AVAILABLE",
                },
            });
        });
    } catch (error) {
        if (error instanceof MyJobOperationError) {
            return {
                status: "error",
                message: error.message,
                fieldErrors: {},
            };
        }

        return {
            status: "error",
            message: "Unable to complete this job. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/my-jobs");
    revalidatePath(`/my-jobs/${result.data.workOrderId}`);
    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${result.data.workOrderId}`);
    revalidatePath("/technicians");

    redirect("/my-jobs");
}

class MyJobOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MyJobOperationError";
    }
}