import { expect, test } from "@playwright/test";

test.describe("public navigation", () => {
    test("home page is available", async ({ page }) => {
        await page.goto("/");

        await expect(page).toHaveURL(/\/$/);
    });

    test("login page is available", async ({ page }) => {
        await page.goto("/login");

        await expect(
            page.getByRole("heading", {
                name: /sign in/i,
            }),
        ).toBeVisible();
    });

    test("signed-out dashboard access redirects to login", async ({
        page,
    }) => {
        await page.goto("/dashboard");

        await expect(page).toHaveURL(/\/login/);
    });

    test("signed-out My Jobs access redirects to login", async ({
        page,
    }) => {
        await page.goto("/my-jobs");

        await expect(page).toHaveURL(/\/login/);
    });
});