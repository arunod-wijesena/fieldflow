"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    WorkOrderActionState,
    WorkOrderField,
    WorkOrderStatusActionState,
} from "@/lib/work-orders/action-state";
import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    workOrderFormSchema,
    workOrderIdSchema,
    workOrderInputSchema,
    workOrderStatusUpdateSchema,
} from "@/lib/validation/work-order";

const WORK_ORDER_WRITE_ROLES = ["ADMIN", "DISPATCHER"] as const;

function readString(formData: FormData, field: WorkOrderField) {
    const value = formData.get(field);

    return typeof value === "string" ? value : "";
}

function readOptionalString(FormData: FormData, field: string) {
    const value = FormData.get(field);

    return typeof value === "string" ? value : "";
}

function getFieldErrors(
    issues: readonly {
        path: readonly PropertyKey[];
        message: string;
    }[],
) {
    const validFields = new Set<WorkOrderField>([
        "title",
        "description",
        "priority",
        "customerId",
        "technicianId",
        "scheduledStart",
        "scheduledEnd",
    ]);

    const fieldErrors: WorkOrderActionState["fieldErrors"] = {};

    for (const issue of issues) {
        const field = issue.path[0];

        if (
            typeof field === "string" &&
            validFields.has(field as WorkOrderField) &&
            !fieldErrors[field as WorkOrderField]
        ) {
            fieldErrors[field as WorkOrderField] = issue.message;
        }
    }

    return fieldErrors;
}

export async function createWorkOrder(
    _previousState: WorkOrderActionState,
    formData: FormData,
): Promise<WorkOrderActionState> {
    const session = await requireAnyRole(WORK_ORDER_WRITE_ROLES);

    const formResult = workOrderFormSchema.safeParse({
        title: readString(formData, "title"),
        description: readString(formData, "description"),
        priority: readString(formData, "priority"),
        customerId: readString(formData, "customerId"),
        technicianId: readString(formData, "technicianId"),
        scheduledStart: readString(formData, "scheduledStart"),
        scheduledEnd: readString(formData, "scheduledEnd"),
    });

    if (!formResult.success) {
        return {
            status: "error",
            message: "Check the highlighted Work Order details.",
            fieldErrors: getFieldErrors(formResult.error.issues),
        };
    }

    const inputResult = workOrderInputSchema.safeParse({
        title: formResult.data.title,
        description: formResult.data.description,
        priority: formResult.data.priority,
        customerId: formResult.data.customerId,
        technicianId: formResult.data.technicianId,
        scheduledStart: formResult.data.scheduledStart
            ? new Date(formResult.data.scheduledStart)
            : undefined,
        scheduledEnd: formResult.data.scheduledEnd
            ? new Date(formResult.data.scheduledEnd)
            : undefined,
    });

    if (!inputResult.success) {
        return {
            status: "error",
            message: "Check the highlighted Work Order details.",
            fieldErrors: getFieldErrors(inputResult.error.issues),
        };
    }

    const input = inputResult.data;
    let workOrderId: string;

    try {
        workOrderId = await prisma.$transaction(async (transaction) => {
            const customer = await transaction.customer.findUnique({
                where: {
                    id: input.customerId,
                },
                select: {
                    id: true,
                },
            });

            if (!customer) {
                throw new WorkOrderInputError(
                    "customerId",
                    "Select a valid Customer.",
                );
            }

            if (input.technicianId) {
                const technician =
                    await transaction.technicianProfile.findUnique({
                        where: {
                            id: input.technicianId,
                        },
                        select: {
                            id: true,
                            availability: true,
                            user: {
                                select: {
                                    role: true,
                                },
                            },
                        },
                    });

                if (!technician) {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "Select a valid Technician.",
                    );
                }

                if (technician.user.role !== "TECHNICIAN") {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "The selected profile is not linked to a Technician account.",
                    );
                }

                if (technician.availability === "UNAVAILABLE") {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "The selected Technician is unavailable.",
                    );
                }
            }

            const initialStatus = input.technicianId
                ? "ASSIGNED"
                : "UNASSIGNED";

            const workOrder = await transaction.workOrder.create({
                data: {
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    status: initialStatus,
                    customerId: input.customerId,
                    technicianId: input.technicianId ?? null,
                    scheduledStart: input.scheduledStart ?? null,
                    scheduledEnd: input.scheduledEnd ?? null,
                    createdById: session.user.id,
                },
                select: {
                    id: true,
                },
            });

            await transaction.workOrderUpdate.create({
                data: {
                    workOrderId: workOrder.id,
                    authorId: session.user.id,
                    previousStatus: null,
                    newStatus: initialStatus,
                    note: input.technicianId
                        ? "Work Order created and assigned."
                        : "Work Order created without an assigned Technician.",
                },
            });

            return workOrder.id;
        });
    } catch (error) {
        if (error instanceof WorkOrderInputError) {
            return {
                status: "error",
                message: "Check the highlighted Work Order details.",
                fieldErrors: {
                    [error.field]: error.message,
                },
            };
        }

        return {
            status: "error",
            message: "Unable to create the Work Order. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/work-orders");
    redirect(`/work-orders/${workOrderId}`);
}

export async function updateWorkOrder(
    workOrderId: string,
    _previousState: WorkOrderActionState,
    formData: FormData,
): Promise<WorkOrderActionState> {
    const session = await requireAnyRole(WORK_ORDER_WRITE_ROLES);

    const idResult = workOrderIdSchema.safeParse({
        id: workOrderId,
    });

    if (!idResult.success) {
        return {
            status: "error",
            message: "Invalid Work Order identifier.",
            fieldErrors: {},
        };
    }

    const formResult = workOrderFormSchema.safeParse({
        title: readString(formData, "title"),
        description: readString(formData, "description"),
        priority: readString(formData, "priority"),
        customerId: readString(formData, "customerId"),
        technicianId: readString(formData, "technicianId"),
        scheduledStart: readString(formData, "scheduledStart"),
        scheduledEnd: readString(formData, "scheduledEnd"),
    });

    if (!formResult.success) {
        return {
            status: "error",
            message: "Check the highlighted Work Order details.",
            fieldErrors: getFieldErrors(formResult.error.issues),
        };
    }

    const inputResult = workOrderInputSchema.safeParse({
        title: formResult.data.title,
        description: formResult.data.description,
        priority: formResult.data.priority,
        customerId: formResult.data.customerId,
        technicianId: formResult.data.technicianId,
        scheduledStart: formResult.data.scheduledStart
            ? new Date(formResult.data.scheduledStart)
            : undefined,
        scheduledEnd: formResult.data.scheduledEnd
            ? new Date(formResult.data.scheduledEnd)
            : undefined,
    });

    if (!inputResult.success) {
        return {
            status: "error",
            message: "Check the highlighted Work Order details.",
            fieldErrors: getFieldErrors(inputResult.error.issues),
        };
    }

    const input = inputResult.data;

    try {
        await prisma.$transaction(async (transaction) => {
            const existingWorkOrder =
                await transaction.workOrder.findUnique({
                    where: {
                        id: idResult.data.id,
                    },
                    select: {
                        id: true,
                        status: true,
                        technicianId: true,
                    },
                });

            if (!existingWorkOrder) {
                throw new WorkOrderOperationError(
                    "Work Order not found.",
                );
            }

            if (
                existingWorkOrder.status === "COMPLETED" ||
                existingWorkOrder.status === "CANCELLED"
            ) {
                throw new WorkOrderOperationError(
                    "Completed or cancelled Work Orders cannot be edited.",
                );
            }

            if (existingWorkOrder.status === "IN_PROGRESS") {
                throw new WorkOrderOperationError(
                    "An in-progress Work Order cannot be reassigned through this form.",
                );
            }

            const customer = await transaction.customer.findUnique({
                where: {
                    id: input.customerId,
                },
                select: {
                    id: true,
                },
            });

            if (!customer) {
                throw new WorkOrderInputError(
                    "customerId",
                    "Select a valid Customer.",
                );
            }

            if (input.technicianId) {
                const technician =
                    await transaction.technicianProfile.findUnique({
                        where: {
                            id: input.technicianId,
                        },
                        select: {
                            id: true,
                            availability: true,
                            user: {
                                select: {
                                    role: true,
                                },
                            },
                        },
                    });

                if (!technician) {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "Select a valid Technician.",
                    );
                }

                if (technician.user.role !== "TECHNICIAN") {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "The selected profile is not linked to a Technician account.",
                    );
                }

                if (technician.availability === "UNAVAILABLE") {
                    throw new WorkOrderInputError(
                        "technicianId",
                        "The selected Technician is unavailable.",
                    );
                }
            }

            const nextStatus: "UNASSIGNED" | "ASSIGNED" =
                input.technicianId ? "ASSIGNED" : "UNASSIGNED";

            const nextTechnicianId = input.technicianId ?? null;

            const assignmentChanged =
                existingWorkOrder.technicianId !== nextTechnicianId;

            const statusChanged =
                existingWorkOrder.status !== nextStatus;

            await transaction.workOrder.update({
                where: {
                    id: idResult.data.id,
                },
                data: {
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                    status: nextStatus,
                    customerId: input.customerId,
                    technicianId: nextTechnicianId,
                    scheduledStart: input.scheduledStart ?? null,
                    scheduledEnd: input.scheduledEnd ?? null,
                },
            });

            if (assignmentChanged || statusChanged) {
                let note: string;

                if (!nextTechnicianId) {
                    note = "Technician removed from the Work Order.";
                } else if (!existingWorkOrder.technicianId) {
                    note = "Technician assigned to the Work Order.";
                } else {
                    note = "Work Order reassigned to another Technician.";
                }

                await transaction.workOrderUpdate.create({
                    data: {
                        workOrderId: idResult.data.id,
                        authorId: session.user.id,
                        previousStatus: existingWorkOrder.status,
                        newStatus: nextStatus,
                        note,
                    },
                });
            }
        });
    } catch (error) {
        if (error instanceof WorkOrderInputError) {
            return {
                status: "error",
                message: "Check the highlighted Work Order details.",
                fieldErrors: {
                    [error.field]: error.message,
                },
            };
        }

        if (error instanceof WorkOrderOperationError) {
            return {
                status: "error",
                message: error.message,
                fieldErrors: {},
            };
        }

        return {
            status: "error",
            message: "Unable to update the Work Order. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${idResult.data.id}`);
    redirect(`/work-orders/${idResult.data.id}`);
}

export async function cancelWorkOrder(
    workOrderId: string,
    _previousState: WorkOrderStatusActionState,
    formData: FormData,
): Promise<WorkOrderStatusActionState> {
    const session = await requireAnyRole(WORK_ORDER_WRITE_ROLES);

    const result = workOrderStatusUpdateSchema.safeParse({
        workOrderId,
        newStatus: "CANCELLED",
        note: readOptionalString(formData, "note"),
    });

    if (!result.success) {
        return {
            status: "error",
            message: "Check the cancellation details.",
            fieldErrors: {
                note:
                    result.error.issues.find(
                        (issue) => issue.path[0] === "note",
                    )?.message ?? undefined,
            },
        };
    }

    try {
        await prisma.$transaction(async (transaction) => {
            const existingWorkOrder = await transaction.workOrder.findUnique({
                where: {
                    id: result.data.workOrderId,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!existingWorkOrder) {
                throw new WorkOrderOperationError("Work Order not found.");
            }

            if (existingWorkOrder.status === "CANCELLED") {
                throw new WorkOrderOperationError(
                    "This Work Order is already cancelled.",
                );
            }

            if (existingWorkOrder.status === "COMPLETED") {
                throw new WorkOrderOperationError(
                    "Completed Work Orders cannot be cancelled.",
                );
            }

            if (existingWorkOrder.status === "IN_PROGRESS") {
                throw new WorkOrderOperationError(
                    "In-progress Work Orders cannot be cancelled through this control.",
                );
            }

            await transaction.workOrder.update({
                where: {
                    id: existingWorkOrder.id,
                },
                data: {
                    status: "CANCELLED",
                },
            });

            await transaction.workOrderUpdate.create({
                data: {
                    workOrderId: existingWorkOrder.id,
                    authorId: session.user.id,
                    previousStatus: existingWorkOrder.status,
                    newStatus: "CANCELLED",
                    note: result.data.note ?? "Work Order cancelled.",
                },
            });
        });
    } catch (error) {
        if (error instanceof WorkOrderOperationError) {
            return {
                status: "error",
                message: error.message,
                fieldErrors: {},
            };
        }

        return {
            status: "error",
            message: "Unable to cancel the Work Order. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${result.data.workOrderId}`);
    redirect(`/work-orders/${result.data.workOrderId}`);
}

class WorkOrderInputError extends Error {
    constructor(
        public readonly field: WorkOrderField,
        message: string,
    ) {
        super(message);
        this.name = "WorkOrderInputError";
    }
}

class WorkOrderOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkOrderOperationError";
    }
}