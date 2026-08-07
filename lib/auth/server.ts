import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";

const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!baseURL) {
    throw new Error("BETTER_AUTH_URL is not configured.");
}

if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not configured.");
}

export const auth = betterAuth({
    baseURL,
    secret,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: ["ADMIN", "DISPATCHER", "TECHNICIAN"],
                required: false,
                defaultValue: "TECHNICIAN",
                input: false,
            },
        },
    },
});