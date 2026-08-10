export type TechnicianField =
    | "userId"
    | "skills"
    | "availability";

export type TechnicianActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: Partial<Record<TechnicianField, string>>;
};

export const initialTechnicianActionState: TechnicianActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};