export type TestUserRole =
    | "ADMIN"
    | "DISPATCHER"
    | "TECHNICIAN";

export type TestUser = {
    email: string;
    password: string;
};

function requireEnvironmentVariable(name: string) {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `Missing required Playwright environment variable: ${name}`,
        );
    }

    return value;
}

export function getTestUser(role: TestUserRole): TestUser {
    if (role === "ADMIN") {
        return {
            email: requireEnvironmentVariable("E2E_ADMIN_EMAIL"),
            password: requireEnvironmentVariable(
                "E2E_ADMIN_PASSWORD",
            ),
        };
    }

    if (role === "DISPATCHER") {
        return {
            email: requireEnvironmentVariable(
                "E2E_DISPATCHER_EMAIL",
            ),
            password: requireEnvironmentVariable(
                "E2E_DISPATCHER_PASSWORD",
            ),
        };
    }

    return {
        email: requireEnvironmentVariable("E2E_TECHNICIAN_EMAIL"),
        password: requireEnvironmentVariable(
            "E2E_TECHNICIAN_PASSWORD",
        ),
    };
}