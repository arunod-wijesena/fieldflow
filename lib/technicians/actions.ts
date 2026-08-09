"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    TechnicianActionState,
    TechnicianField,
} from "@/lib/technicians/action-state";
import { prisma } from "@/lib/db/prisma";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    technicianFormSchema,
    technicianIdSchema,
    technicianProfileSchema,
    technicianProfileUpdateSchema,
    technicianUpdateFormSchema,
} from "@/lib/validation/technician";

const TECHNICIAN_WRITE_ROLES = ["ADMIN", "DISPATCHER"] as const;

function readString(formData: FormData, field: TechnicianField) {
    const value = formData.get(field);

    return typeof value === "string" ? value : "";
}

function getFieldErrors(
    issues: readonly {
        path: readonly PropertyKey[];
        message: string;
    }[],
) {
    const fieldErrors: TechnicianActionState["fieldErrors"] = {};

    for (const issue of issues) {
        const field = issue.path[0];

        if (
            typeof field === "string" &&
            ["userId", "skills", "availability"].includes(field) &&
            !fieldErrors[field as TechnicianField]
        ) {
            fieldErrors[field as TechnicianField] = issue.message;
        }
    }

    return fieldErrors;
}

export async function createTechnicianProfile(
    _previousState: TechnicianActionState,
    formData: FormData,
): Promise<TechnicianActionState> {
    await requireAnyRole(TECHNICIAN_WRITE_ROLES);

    const formResult = technicianFormSchema.safeParse({
        userId: readString(formData, "userId"),
        skills: readString(formData, "skills"),
        availability: readString(formData, "availability"),
    });

    if (!formResult.success) {
        return {
            status: "error",
            message: "Check the highlighted technician details.",
            fieldErrors: getFieldErrors(formResult.error.issues),
        };
    }

    const profileResult = technicianProfileSchema.safeParse({
        userId: formResult.data.userId,
        skills: formResult.data.skills,
        availability: formResult.data.availability,
    });

    if (!profileResult.success) {
        return {
            status: "error",
            message: "Check the highlighted technician details.",
            fieldErrors: getFieldErrors(profileResult.error.issues),
        };
    }

    let technicianProfileId: string;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: profileResult.data.userId,
            },
            select: {
                id: true,
                role: true,
                technicianProfile: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!user) {
            return {
                status: "error",
                message: "The selected technician account was not found.",
                fieldErrors: {
                    userId: "Select a valid technician account.",
                },
            };
        }

        if (user.role !== "TECHNICIAN") {
            return {
                status: "error",
                message: "The selected account is not a Technician account.",
                fieldErrors: {
                    userId: "Select an account with the Technician role.",
                },
            };
        }

        if (user.technicianProfile) {
            return {
                status: "error",
                message: "The selected account already has a technician profile.",
                fieldErrors: {
                    userId: "Select an account without an existing profile.",
                },
            };
        }

        const technicianProfile = await prisma.technicianProfile.create({
            data: {
                userId: profileResult.data.userId,
                skills: profileResult.data.skills,
                availability: profileResult.data.availability,
            },
            select: {
                id: true,
            },
        });

        technicianProfileId = technicianProfile.id;
    } catch {
        return {
            status: "error",
            message: "Unable to create the technician profile. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/technicians");
    redirect(`/technicians/${technicianProfileId}`);
}

export async function updateTechnicianProfile(
    technicianProfileId: string,
    _previousState: TechnicianActionState,
    formData: FormData,
): Promise<TechnicianActionState> {
    await requireAnyRole(TECHNICIAN_WRITE_ROLES);

    const idResult = technicianIdSchema.safeParse({
        id: technicianProfileId,
    });

    if (!idResult.success) {
        return {
            status: "error",
            message: "Invalid technician profile identifier.",
            fieldErrors: {},
        };
    }

    const formResult = technicianUpdateFormSchema.safeParse({
        skills: readString(formData, "skills"),
        availability: readString(formData, "availability"),
    });

    if (!formResult.success) {
        return {
            status: "error",
            message: "Check the highlighted technician details.",
            fieldErrors: getFieldErrors(formResult.error.issues),
        };
    }

    const profileResult = technicianProfileUpdateSchema.safeParse({
        skills: formResult.data.skills,
        availability: formResult.data.availability,
    });

    if (!profileResult.success) {
        return {
            status: "error",
            message: "Check the highlighted technician details.",
            fieldErrors: getFieldErrors(profileResult.error.issues),
        };
    }

    try {
        const existingProfile =
            await prisma.technicianProfile.findUnique({
                where: {
                    id: idResult.data.id,
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

        if (!existingProfile) {
            return {
                status: "error",
                message: "Technician profile not found.",
                fieldErrors: {},
            };
        }

        if (existingProfile.user.role !== "TECHNICIAN") {
            return {
                status: "error",
                message:
                    "The linked account is no longer a valid Technician account.",
                fieldErrors: {},
            };
        }

        await prisma.technicianProfile.update({
            where: {
                id: idResult.data.id,
            },
            data: {
                skills: profileResult.data.skills,
                availability: profileResult.data.availability,
            },
        });
    } catch {
        return {
            status: "error",
            message: "Unable to update the technician profile. Please try again.",
            fieldErrors: {},
        };
    }

    revalidatePath("/technicians");
    revalidatePath(`/technicians/${idResult.data.id}`);
    redirect(`/technicians/${idResult.data.id}`);
}