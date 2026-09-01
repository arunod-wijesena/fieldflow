import { expect, test } from "@playwright/test";
import { resetAuthenticationState, signInAs, signOut } from "./support/auth";
import {
    createCustomerTestData,
    createWorkOrderTestData,
} from "./support/test-data";
import { getE2ETechnicianName } from "./support/test-users";

test.describe("Technician job workflow", () => {
    test("assigned Technician starts, updates, and completes a job", async ({
        page,
    }) => {
        test.setTimeout(180_000);

        const customer = createCustomerTestData();
        const workOrder = createWorkOrderTestData();
        const technicianName = getE2ETechnicianName();

        const progressNote =
            "Playwright recorded fictional inspection progress.";

        const completionNotes =
            "Playwright completed the fictional inspection and recorded the final outcome.";

        /*
         * Dispatcher creates a unique Customer.
         */
        await signInAs(page, "DISPATCHER");
        await page.goto("/customers/new");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Add customer",
            }),
        ).toBeVisible();

        await page.locator("#name").fill(customer.name);
        await page.locator("#email").fill(customer.email);
        await page.locator("#phone").fill(customer.phone);

        await page
            .locator("#addressLine1")
            .fill(customer.addressLine1);

        await page
            .locator("#addressLine2")
            .fill(customer.addressLine2);

        await page.locator("#city").fill(customer.city);
        await page.locator("#postcode").fill(customer.postcode);

        const customerSubmit =
            page.getByTestId("customer-submit");

        await expect(customerSubmit).toBeEnabled();
        await customerSubmit.click();

        await expect(page).toHaveURL(
            /\/customers\/(?!new(?:\/|$))[^/?]+(?:\?.*)?$/,
            {
                timeout: 30_000,
            },
        );

        /*
         * Dispatcher creates a Work Order assigned specifically to the
         * E2E Technician.
         */
        await page.goto("/work-orders/new");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Create Work Order",
            }),
        ).toBeVisible({
            timeout: 30_000,
        });

        await page.locator("#title").fill(workOrder.title);

        await page
            .locator("#description")
            .fill(workOrder.description);

        await page.locator("#priority").selectOption("HIGH");

        const customerSelect = page.locator("#customerId");

        const customerOption = customerSelect
            .locator("option")
            .filter({
                hasText: customer.name,
            });

        await expect(customerOption).toHaveCount(1);

        const customerValue =
            await customerOption.getAttribute("value");

        if (!customerValue) {
            throw new Error(
                "The E2E Customer did not have a selectable option value.",
            );
        }

        await customerSelect.selectOption(customerValue);

        const technicianSelect = page.locator("#technicianId");

        const technicianOption = technicianSelect
            .locator("option:not([disabled])")
            .filter({
                hasText: technicianName,
            });

        await expect(technicianOption).toHaveCount(1);

        const technicianValue =
            await technicianOption.getAttribute("value");

        if (!technicianValue) {
            throw new Error(
                "The E2E Technician did not have a selectable option value.",
            );
        }

        await technicianSelect.selectOption(technicianValue);

        await expect(technicianSelect).toHaveValue(
            technicianValue,
        );

        const workOrderSubmit =
            page.getByTestId("work-order-submit");

        await expect(workOrderSubmit).toBeEnabled();
        await workOrderSubmit.click();

        await expect(page).toHaveURL(
            /\/work-orders\/(?!new(?:\/|$))[^/?]+(?:\?.*)?$/,
            {
                timeout: 30_000,
            },
        );

        const workOrderDetailsPath =
            new URL(page.url()).pathname;

        expect(workOrderDetailsPath).toMatch(
            /^\/work-orders\/(?!new(?:\/|$))[^/?]+$/,
        );

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: workOrder.title,
            }),
        ).toBeVisible();

        await expect(
            page.getByText("Created as Assigned", {
                exact: true,
            }),
        ).toBeVisible();

        /*
         * Technician opens the assigned Work Order.
         */
        await signOut(page);
        await resetAuthenticationState(page);
        await signInAs(page, "TECHNICIAN");

        await expect(
            page.getByRole("link", {
                name: workOrder.title,
                exact: true,
            }),
        ).toBeVisible({
            timeout: 30_000,
        });

        await page
            .getByRole("link", {
                name: workOrder.title,
                exact: true,
            })
            .click();

        await expect(page).toHaveURL(
            /\/my-jobs\/[^/?]+(?:\?.*)?$/,
            {
                timeout: 30_000,
            },
        );

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: workOrder.title,
            }),
        ).toBeVisible();

        /*
         * Start Work.
         */
        const startWorkSubmit =
            page.getByTestId("start-work-submit");

        await expect(startWorkSubmit).toBeVisible();
        await expect(startWorkSubmit).toBeEnabled();

        await startWorkSubmit.click();

        await expect(
            page.getByText("In progress", {
                exact: true,
            }),
        ).toBeVisible({
            timeout: 30_000,
        });

        await expect(
            page.getByTestId("start-work-submit"),
        ).toHaveCount(0);

        await expect(
            page.getByText("Technician started work.", {
                exact: true,
            }),
        ).toBeVisible();

        /*
         * Add a progress note.
         */
        const progressInput =
            page.getByTestId("progress-note");

        const progressSubmit =
            page.getByTestId("progress-note-submit");

        await expect(progressInput).toBeVisible();
        await expect(progressSubmit).toBeEnabled();

        await progressInput.fill(progressNote);
        await progressSubmit.click();

        await expect(
            page.getByText(progressNote, {
                exact: true,
            }),
        ).toBeVisible({
            timeout: 30_000,
        });

        await expect(
            page.getByText("In progress", {
                exact: true,
            }),
        ).toBeVisible();

        /*
         * Complete the Work Order.
         */
        const completionInput =
            page.getByTestId("completion-notes");

        const completionSubmit =
            page.getByTestId("complete-job-submit");

        await expect(completionInput).toBeVisible();
        await expect(completionSubmit).toBeEnabled();

        await completionInput.fill(completionNotes);
        await completionSubmit.click();

        await expect(page).toHaveURL(/\/my-jobs(?:\?.*)?$/, {
            timeout: 30_000,
        });

        await expect(
            page.getByRole("link", {
                name: workOrder.title,
                exact: true,
            }),
        ).toHaveCount(0);

        /*
         * Dispatcher verifies the completed result and audit history.
         */
        await signOut(page);
        await resetAuthenticationState(page);
        await signInAs(page, "DISPATCHER");

        await page.goto(workOrderDetailsPath, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
        });

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: workOrder.title,
            }),
        ).toBeVisible();

        await expect(
            page.locator("span").filter({
                hasText: /^Completed$/,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(completionNotes, {
                exact: true,
            }).first(),
        ).toBeVisible();

        await expect(
            page.getByText("In progress to Completed", {
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(progressNote, {
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            page.getByText("Technician started work.", {
                exact: true,
            }),
        ).toBeVisible();
    });
});