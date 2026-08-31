import { expect, test } from "@playwright/test";
import { signInAs } from "./support/auth";
import {
    createCustomerTestData,
    createWorkOrderTestData,
} from "./support/test-data";

type InvalidFormControl = {
    id: string;
    name: string;
    validationMessage: string;
    value: string;
};

test.describe("Dispatcher Work Order workflow", () => {
    test("Dispatcher creates an assigned Work Order", async ({
        page,
    }) => {
        const customer = createCustomerTestData();
        const workOrder = createWorkOrderTestData();

        await signInAs(page, "DISPATCHER");

        /*
         * Create a unique fictional Customer.
         */
        await page.goto("/customers/new");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Add customer",
            }),
        ).toBeVisible();

        const customerSubmitButton =
            page.getByTestId("customer-submit");

        await expect(customerSubmitButton).toBeVisible();
        await expect(customerSubmitButton).toBeEnabled();

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

        await customerSubmitButton.click();

        await expect(page).toHaveURL(
            /\/customers\/(?!new(?:\/|$))[^/?]+(?:\?.*)?$/,
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

        /*
         * Open Work Order creation.
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

        const workOrderForm =
            page.getByTestId("work-order-form");

        const titleInput = page.locator("#title");
        const descriptionInput = page.locator("#description");
        const prioritySelect = page.locator("#priority");
        const customerSelect = page.locator("#customerId");
        const technicianSelect = page.locator("#technicianId");

        const workOrderSubmitButton =
            page.getByTestId("work-order-submit");

        await expect(workOrderForm).toBeVisible();
        await expect(titleInput).toBeVisible();
        await expect(descriptionInput).toBeVisible();
        await expect(prioritySelect).toBeVisible();
        await expect(customerSelect).toBeVisible();
        await expect(technicianSelect).toBeVisible();
        await expect(workOrderSubmitButton).toBeVisible();
        await expect(workOrderSubmitButton).toBeEnabled();

        /*
         * Enter Work Order details.
         */
        await titleInput.fill(workOrder.title);
        await descriptionInput.fill(workOrder.description);
        await prioritySelect.selectOption("HIGH");

        /*
         * Select the Customer created in this test.
         */
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
                "The newly created Customer did not have a selectable option value.",
            );
        }

        await customerSelect.selectOption(customerValue);

        await expect(customerSelect).toHaveValue(
            customerValue,
        );

        /*
         * Select the first enabled Technician.
         */
        const assignableOptions = technicianSelect.locator(
            "option:not([value='']):not([disabled])",
        );

        const assignableCount = await assignableOptions.count();

        expect(assignableCount).toBeGreaterThan(0);

        const technicianValue = await assignableOptions
            .first()
            .getAttribute("value");

        if (!technicianValue) {
            throw new Error(
                "No assignable Technician option value was available.",
            );
        }

        await technicianSelect.selectOption(technicianValue);

        await expect(technicianSelect).toHaveValue(
            technicianValue,
        );

        /*
         * Confirm entered values before submission.
         */
        await expect(titleInput).toHaveValue(workOrder.title);

        await expect(descriptionInput).toHaveValue(
            workOrder.description,
        );

        await expect(prioritySelect).toHaveValue("HIGH");
        await expect(customerSelect).toHaveValue(customerValue);

        await expect(technicianSelect).toHaveValue(
            technicianValue,
        );

        /*
         * Detect native browser validation before clicking.
         */
        const formIsValid = await workOrderForm.evaluate(
            (form) => {
                if (!(form instanceof HTMLFormElement)) {
                    return false;
                }

                return form.checkValidity();
            },
        );

        if (!formIsValid) {
            const invalidControls =
                await workOrderForm.evaluate((form) => {
                    if (!(form instanceof HTMLFormElement)) {
                        return [];
                    }

                    return Array.from(form.elements)
                        .filter(
                            (
                                control,
                            ): control is
                                | HTMLInputElement
                                | HTMLTextAreaElement
                                | HTMLSelectElement =>
                                control instanceof HTMLInputElement ||
                                control instanceof HTMLTextAreaElement ||
                                control instanceof HTMLSelectElement,
                        )
                        .filter((control) => !control.validity.valid)
                        .map((control) => ({
                            id: control.id,
                            name: control.name,
                            validationMessage:
                                control.validationMessage,
                            value: control.value,
                        }));
                });

            throw new Error(
                `The Work Order form failed browser validation: ${JSON.stringify(
                    invalidControls satisfies InvalidFormControl[],
                )}`,
            );
        }

        /*
         * Wait for the server-action POST generated by the form.
         */
        const submissionResponsePromise = page.waitForResponse(
            (response) => {
                const request = response.request();
                const pathname = new URL(response.url()).pathname;

                return (
                    request.method() === "POST" &&
                    pathname === "/work-orders/new"
                );
            },
            {
                timeout: 30_000,
            },
        );

        await workOrderSubmitButton.click();

        const submissionResponse =
            await submissionResponsePromise;

        if (!submissionResponse.ok()) {
            throw new Error(
                `Work Order submission failed with HTTP ${submissionResponse.status()}.`,
            );
        }

        /*
         * The successful server action must leave /work-orders/new.
         */
        await expect
            .poll(
                () => new URL(page.url()).pathname,
                {
                    timeout: 30_000,
                    message:
                        "Expected Work Order creation to redirect to the details page.",
                },
            )
            .toMatch(
                /^\/work-orders\/(?!new(?:\/|$))[^/?]+$/,
            );

        await expect(page).toHaveURL(
            /\/work-orders\/(?!new(?:\/|$))[^/?]+(?:\?.*)?$/,
            {
                timeout: 30_000,
            },
        );

        /*
         * Verify details and initial audit history.
         */
        await expect(
            page.getByRole("heading", {
                level: 1,
                name: workOrder.title,
            }),
        ).toBeVisible({
            timeout: 30_000,
        });

        await expect(
            page.getByText("Assigned", {
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(customer.name, {
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            page.getByText("Created as Assigned", {
                exact: true,
            }),
        ).toBeVisible();

        await expect(
            page.getByText(
                "Work Order created and assigned.",
                {
                    exact: true,
                },
            ),
        ).toBeVisible();

        /*
         * Verify search results.
         */
        await page.goto(
            `/work-orders?query=${encodeURIComponent(
                workOrder.title,
            )}`,
        );

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: "Work Orders",
            }),
        ).toBeVisible();

        await expect(
            page.getByRole("link", {
                name: workOrder.title,
                exact: true,
            }),
        ).toBeVisible();
    });
});