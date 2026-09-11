import { expect, test } from "@playwright/test";

test.describe("public navigation", () => {
    test("home page is available", async ({ page }) => {
        await page.goto("/", {
            waitUntil: "domcontentloaded",
        });

        await expect(page).toHaveURL(/\/$/);

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /keep every field job moving forward/i,
            }),
        ).toBeVisible();

        await expect(
            page
                .getByRole("link", {
                    name: /sign in to fieldflow/i,
                })
                .first(),
        ).toBeVisible();

        await expect(page).toHaveTitle(/FieldFlow/);
    });

    test("login page is available from the home page", async ({
        page,
    }) => {
        await page.goto("/", {
            waitUntil: "domcontentloaded",
        });

        const signInLink = page
            .getByRole("link", {
                name: /sign in to fieldflow/i,
            })
            .first();

        await expect(signInLink).toBeVisible();

        await signInLink.click();

        await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
            timeout: 30_000,
        });

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /sign in/i,
            }),
        ).toBeVisible();

        await expect(page.getByLabel(/email/i)).toBeVisible();

        await expect(
            page.getByLabel(/password/i),
        ).toBeVisible();

        await expect(
            page.getByRole("button", {
                name: /sign in/i,
            }),
        ).toBeVisible();
    });

    test("signed-out dashboard access redirects to login", async ({
        page,
    }) => {
        await page.goto("/dashboard", {
            waitUntil: "domcontentloaded",
        });

        await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
            timeout: 30_000,
        });

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /sign in/i,
            }),
        ).toBeVisible();
    });

    test("signed-out My Jobs access redirects to login", async ({
        page,
    }) => {
        await page.goto("/my-jobs", {
            waitUntil: "domcontentloaded",
        });

        await expect(page).toHaveURL(/\/login(?:\?.*)?$/, {
            timeout: 30_000,
        });

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /sign in/i,
            }),
        ).toBeVisible();
    });
});