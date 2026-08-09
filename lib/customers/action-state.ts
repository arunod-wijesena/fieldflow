export type CustomerField =
    | "name"
    | "email"
    | "phone"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "postcode";

export type CustomerActionState = {
    status: "idle" | "error";
    message: string;
    fieldErrors: Partial<Record<CustomerField, string>>;
};

export const initialCustomerActionState: CustomerActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
};