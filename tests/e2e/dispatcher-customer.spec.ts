import { expect, test } from "@playwright/test";
import { signInAs } from "./support/auth";
import { createCustomerTestData } from "./support/test-data";

test.describe("Dispatcher Customer workflow", () => {
    test("Dispatcher sees Customer validation errors", async ({
        page,
    }) => {
        await signInAs(page, "DISPATCHER");
        await page.goto("/customers/new");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Add customer",
            }),
        ).toBeVisible();

        const submitButton = page.getByTestId("customer-submit");

        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();

        await page
            .getByLabel(/customer name/i)
            .fill("Validation Test Customer");

        const emailInput = page.getByLabel(/^email$/i);

        await emailInput.fill("not-an-email");

        await page
            .getByLabel(/address line 1/i)
            .fill("1 Fictional Road");

        await page.locator("#city").fill("Testford");

        await page
            .getByLabel(/postcode/i)
            .fill("TE1 2ST");

        await submitButton.click();

        await expect(page).toHaveURL(/\/customers\/new/);

        await expect(emailInput).toHaveJSProperty(
            "validity.typeMismatch",
            true,
        );
    });

    test("Dispatcher creates and finds a fictional Customer", async ({
        page,
    }) => {
        const customer = createCustomerTestData();

        await signInAs(page, "DISPATCHER");
        await page.goto("/customers/new");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Add customer",
            }),
        ).toBeVisible();

        const submitButton = page.getByTestId("customer-submit");

        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();

        await page
            .getByLabel(/customer name/i)
            .fill(customer.name);

        await page
            .getByLabel(/^email$/i)
            .fill(customer.email);

        await page
            .getByLabel(/^phone$/i)
            .fill(customer.phone);

        await page
            .getByLabel(/address line 1/i)
            .fill(customer.addressLine1);

        await page
            .getByLabel(/address line 2/i)
            .fill(customer.addressLine2);

        await page.locator("#city").fill(customer.city);

        await page
            .getByLabel(/postcode/i)
            .fill(customer.postcode);

        await submitButton.click();

        await expect(page).toHaveURL(
            /\/customers\/[^/]+$/,
            {
                timeout: 30_000,
            },
        );

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: customer.name,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(customer.email, {
                exact: true,
            }),
        ).toBeVisible();

        await page.goto(
            `/customers?query=${encodeURIComponent(customer.name)}`,
        );

        await expect(
            page.getByRole("link", {
                name: customer.name,
                exact: true,
            }),
        ).toBeVisible();
    });
});