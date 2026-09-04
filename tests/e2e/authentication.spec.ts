import { expect, test } from "@playwright/test";
import { signInAs, signOut } from "./support/auth";

test.describe("authentication", () => {
    test("invalid credentials show a generic error", async ({
        page,
    }) => {
        await page.goto("/login");
        await page.waitForLoadState("domcontentloaded");

        await page
            .getByLabel(/email/i)
            .fill("invalid-user@example.invalid");

        await page
            .getByLabel(/password/i)
            .fill("incorrect-fictional-password");

        const responsePromise = page.waitForResponse(
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

        await page
            .getByRole("button", {
                name: /sign in/i,
            })
            .click();

        const response = await responsePromise;

        expect(response.status()).toBeGreaterThanOrEqual(400);

        await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

        await expect(
            page.getByText(
                "Unable to sign in with the provided credentials.",
                {
                    exact: true,
                },
            ),
        ).toBeVisible({
            timeout: 15_000,
        });
    });

    test("Dispatcher signs in and reaches Dashboard", async ({
        page,
    }) => {
        await signInAs(page, "DISPATCHER");

        await expect(
            page.getByRole("heading", {
                name: "Dashboard",
            }),
        ).toBeVisible();
    });

    test("Technician signs in and reaches My Jobs", async ({
        page,
    }) => {
        await signInAs(page, "TECHNICIAN");

        await expect(
            page.getByRole("heading", {
                name: "My Jobs",
            }),
        ).toBeVisible();
    });

    test("sign-out protects authenticated routes", async ({
        page,
    }) => {
        await signInAs(page, "DISPATCHER");
        await signOut(page);

        await page.goto("/work-orders");

        await expect(page).toHaveURL(/\/login/);
    });
});