import { expect, type Page } from "@playwright/test";
import {
    getTestUser,
    type TestUserRole,
} from "./test-users";

const landingRoutes = {
    ADMIN: "/dashboard",
    DISPATCHER: "/dashboard",
    TECHNICIAN: "/my-jobs",
} satisfies Record<TestUserRole, string>;

export async function signInAs(
    page: Page,
    role: TestUserRole,
) {
    const user = getTestUser(role);

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole("button", {
        name: /sign in/i,
    });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);

    const signInResponsePromise = page.waitForResponse(
        (response) => {
            const url = response.url();

            return (
                url.includes("/api/auth/") &&
                url.includes("sign-in")
            );
        },
        {
            timeout: 30_000,
        },
    );

    await submitButton.click();

    const signInResponse = await signInResponsePromise;

    if (!signInResponse.ok()) {
        throw new Error(
            `Authentication request failed for ${role} with HTTP ${signInResponse.status()}.`,
        );
    }

    await expect(page).toHaveURL(
        new RegExp(`${landingRoutes[role]}(?:\\?.*)?$`),
        {
            timeout: 30_000,
        },
    );
}

export async function signOut(page: Page) {
    const signOutButton = page.getByRole("button", {
        name: /sign out/i,
    });

    await expect(signOutButton).toBeEnabled();

    await signOutButton.click();

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
        timeout: 30_000,
    });
}