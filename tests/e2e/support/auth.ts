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
    const landingRoute = landingRoutes[role];

    await page.goto("/login", {
        waitUntil: "load",
        timeout: 30_000,
    });

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
        timeout: 30_000,
    });

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole("button", {
        name: /sign in/i,
    });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    /*
     * Wait for two browser paint cycles before filling.
     * This reduces the chance that React hydration resets values entered
     * immediately after the initial HTML response.
     */
    await waitForBrowserPaint(page);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
        await emailInput.fill(user.email);
        await passwordInput.fill(user.password);

        /*
         * Prove that the browser contains the expected values immediately
         * before submission. Playwright does not print the values unless
         * this assertion fails, so do not include failure artifacts in
         * evidence without reviewing them.
         */
        await expect(emailInput).toHaveValue(user.email);
        await expect(passwordInput).toHaveValue(user.password);

        await submitButton.click();

        const result = await waitForAuthenticationResult(
            page,
            landingRoute,
        );

        if (result === "authenticated") {
            await expect(page).toHaveURL(
                new RegExp(
                    `${escapeRegularExpression(
                        landingRoute,
                    )}(?:\\?.*)?$`,
                ),
                {
                    timeout: 30_000,
                },
            );

            await page.waitForLoadState("domcontentloaded");

            return;
        }

        if (
            result.includes("Email is required") ||
            result.includes("Password is required")
        ) {
            if (attempt === 1) {
                /*
                 * A hydration reset probably cleared the fields. Wait for the
                 * UI to settle and refill once.
                 */
                await waitForBrowserPaint(page);

                continue;
            }
        }

        throw new Error(
            `Unable to authenticate ${role}. ${result}`,
        );
    }

    throw new Error(
        `Unable to authenticate ${role} after retrying the login form.`,
    );
}

export async function signOut(page: Page) {
    const signOutButton = page.getByRole("button", {
        name: /sign out/i,
    });

    await expect(signOutButton).toBeVisible();
    await expect(signOutButton).toBeEnabled();

    await signOutButton.click();

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
        timeout: 30_000,
    });

    await page.waitForLoadState("domcontentloaded");
}

export async function resetAuthenticationState(
    page: Page,
) {
    await page.context().clearCookies();

    await page.goto("/login", {
        waitUntil: "load",
        timeout: 30_000,
    });

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
        timeout: 30_000,
    });

    await waitForBrowserPaint(page);
}

async function waitForAuthenticationResult(
    page: Page,
    landingRoute: string,
) {
    let latestResult = "waiting";

    try {
        await expect
            .poll(
                async () => {
                    const pathname = new URL(page.url()).pathname;

                    if (pathname === landingRoute) {
                        latestResult = "authenticated";
                        return latestResult;
                    }

                    const messages =
                        await getVisibleApplicationAlerts(page);

                    if (messages.length > 0) {
                        latestResult = `login-error: ${messages.join(
                            " | ",
                        )}`;

                        return latestResult;
                    }

                    latestResult = `waiting:${pathname}`;

                    return latestResult;
                },
                {
                    timeout: 30_000,
                    intervals: [250, 500, 1_000],
                },
            )
            .not.toMatch(/^waiting:/);
    } catch {
        return latestResult;
    }

    return latestResult;
}

async function getVisibleApplicationAlerts(
    page: Page,
) {
    const alerts = page.locator(
        '[role="alert"]:not(#__next-route-announcer__)',
    );

    const messages: string[] = [];

    for (
        let index = 0;
        index < (await alerts.count());
        index += 1
    ) {
        const alert = alerts.nth(index);

        if (!(await alert.isVisible())) {
            continue;
        }

        const message = (await alert.textContent())?.trim();

        if (message) {
            messages.push(message);
        }
    }

    return messages;
}

async function waitForBrowserPaint(page: Page) {
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        resolve();
                    });
                });
            }),
    );
}

function escapeRegularExpression(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}