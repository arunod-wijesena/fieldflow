export type MyJobActionState = {
    status: "idle" | "error";
    message: string;
};

export const initialMyJobActionState: MyJobActionState = {
    status: "idle",
    message: "",
};

export type MyJobProgressActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: {
        note?: string;
    };
};

export type MyJobCompletionActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: {
        completionNotes?: string;
    };
};

export const initialMyJobCompletionActionState: MyJobCompletionActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};

export const initialMyJobProgressActionState: MyJobProgressActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};