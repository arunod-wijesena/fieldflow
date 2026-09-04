export function createUniqueTestSuffix() {
    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

export function createCustomerTestData() {
    const suffix = createUniqueTestSuffix();

    return {
        name: `E2E Customer ${suffix}`,
        email: `e2e-customer-${suffix}@example.invalid`,
        phone: "020 7946 0958",
        addressLine1: "100 Fictional Service Road",
        addressLine2: "Test Suite",
        city: "Testford",
        postcode: "TE1 2ST",
    };
}

export function createWorkOrderTestData() {
    const suffix = createUniqueTestSuffix();

    return {
        title: `E2E Work Order ${suffix}`,
        description:
            "Automated fictional service inspection created by Playwright.",
    };
}