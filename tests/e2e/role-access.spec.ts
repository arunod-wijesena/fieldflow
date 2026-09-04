import { expect, test } from "@playwright/test";
import { signInAs } from "./support/auth";

test.describe("role authorization", () => {
    test("Technician is denied operational management pages", async ({
        page,
    }) => {
        await signInAs(page, "TECHNICIAN");

        const deniedRoutes = [
            "/dashboard",
            "/customers",
            "/technicians",
            "/work-orders",
        ];

        for (const route of deniedRoutes) {
            await page.goto(route);

            await expect(page).toHaveURL(/\/unauthorized/);
        }
    });

    test("Dispatcher is denied My Jobs", async ({ page }) => {
        await signInAs(page, "DISPATCHER");

        await page.goto("/my-jobs");

        await expect(page).toHaveURL(/\/unauthorized/);
    });

    test("Administrator is denied My Jobs", async ({ page }) => {
        await signInAs(page, "ADMIN");

        await page.goto("/my-jobs");

        await expect(page).toHaveURL(/\/unauthorized/);
    });

    test("Dispatcher can access operational pages", async ({
        page,
    }) => {
        await signInAs(page, "DISPATCHER");

        const allowedPages = [
            {
                route: "/dashboard",
                heading: "Dashboard",
            },
            {
                route: "/customers",
                heading: "Customers",
            },
            {
                route: "/technicians",
                heading: "Technicians",
            },
            {
                route: "/work-orders",
                heading: "Work Orders",
            },
        ];

        for (const allowedPage of allowedPages) {
            await page.goto(allowedPage.route);

            await expect(
                page.getByRole("heading", {
                    name: allowedPage.heading,
                }),
            ).toBeVisible();
        }
    });
});