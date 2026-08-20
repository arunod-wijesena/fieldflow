export type MyJobActionState = {
    status: "idle" | "error";
    message: string;
};

export const initialMyJobActionState: MyJobActionState = {
    status: "idle",
    message: "",
};