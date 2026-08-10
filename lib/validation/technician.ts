import { z } from "zod";

export const technicianAvailabilityValues = [
    "AVAILABLE",
    "BUSY",
    "UNAVAILABLE",
] as const;

export const technicianAvailabilitySchema = z.enum(
    technicianAvailabilityValues,
);

function normalizeSkills(skills: string[]) {
    const seenSkills = new Set<string>();

    return skills
        .map((skill) => skill.trim())
        .filter(Boolean)
        .filter((skill) => {
            const normalizedSkill = skill.toLowerCase();

            if (seenSkills.has(normalizedSkill)) {
                return false;
            }

            seenSkills.add(normalizedSkill);
            return true;
        });
}

const skillSchema = z
    .string()
    .trim()
    .min(1, "Skill must not be empty.")
    .max(60, "Each skill must not exceed 60 characters.");

export const technicianProfileSchema = z.object({
    userId: z.string().trim().min(1, "Technician account is required."),

    skills: z
        .array(skillSchema)
        .max(20, "A technician may have no more than 20 skills.")
        .transform(normalizeSkills),

    availability: technicianAvailabilitySchema,
});

export const technicianFormSchema = z.object({
    userId: z.string().trim().min(1, "Technician account is required."),

    skills: z
        .string()
        .trim()
        .max(1_200, "Skills must not exceed 1,200 characters.")
        .transform((value) =>
            value
                .split(/[,\r\n]+/)
                .map((skill) => skill.trim())
                .filter(Boolean),
        ),

    availability: technicianAvailabilitySchema,
});

export const technicianUpdateFormSchema = technicianFormSchema.omit({
    userId: true,
});

export const technicianProfileUpdateSchema = z.object({
    skills: z
        .array(skillSchema)
        .max(20, "A technician may have no more than 20 skills.")
        .transform(normalizeSkills),

    availability: technicianAvailabilitySchema,
});

export const technicianSearchSchema = z.object({
    query: z
        .string()
        .trim()
        .max(100, "Search must not exceed 100 characters.")
        .default(""),

    availability: z
        .union([technicianAvailabilitySchema, z.literal("")])
        .default(""),
});

export const technicianIdSchema = z.object({
    id: z.string().cuid("Invalid technician profile identifier."),
});

export type TechnicianProfileInput = z.infer<
    typeof technicianProfileSchema
>;

export type TechnicianFormInput = z.infer<typeof technicianFormSchema>;

export type TechnicianSearchInput = z.infer<
    typeof technicianSearchSchema
>;

export type TechnicianUpdateFormInput = z.infer<
    typeof technicianUpdateFormSchema
>;

export type TechnicianProfileUpdateInput = z.infer<
    typeof technicianProfileUpdateSchema
>;