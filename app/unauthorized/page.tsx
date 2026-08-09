import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <section className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                    Access denied
                </h1>

                <p className="mt-3 text-slate-600">
                    Your account does not have permission to access this page.
                </p>

                <Link
                    href="/"
                    className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Return to home
                </Link>
            </section>
        </main>
    );
}