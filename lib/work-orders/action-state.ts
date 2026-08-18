export type WorkOrderField =
    | "title"
    | "description"
    | "priority"
    | "customerId"
    | "technicianId"
    | "scheduledStart"
    | "scheduledEnd";

export type WorkOrderActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: Partial<Record<WorkOrderField, string>>;
};

export const initialWorkOrderActionState: WorkOrderActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};

export type WorkOrderStatusField = "note";

export type WorkOrderStatusActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: Partial<Record<WorkOrderStatusField, string>>;
};

export const initialWorkOrderStatusActionState: WorkOrderStatusActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};