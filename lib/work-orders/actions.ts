"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    WorkOrderActionState,
    WorkOrderField,
} from "@/lib/work-orders/action-state";
import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    workOrderFormSchema,
    workOrderInputSchema,
} from "@/lib/validation/work-order";

const WORK_ORDER_WRITE_ROLES = ["ADMIN", "DISPATCHER"] as const;

function readString(formData: FormData, field: WorkOrderField) {
    const value = formData.get(field);

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

class WorkOrderInputError extends Error {
    constructor(
        public readonly field: WorkOrderField,
        message: string,
    ) {
        super(message);
        this.name = "WorkOrderInputError";
    }
}