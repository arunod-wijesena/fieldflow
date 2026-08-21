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

export const initialMyJobProgressActionState: MyJobProgressActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};