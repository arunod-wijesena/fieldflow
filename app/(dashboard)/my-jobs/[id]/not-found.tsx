import Link from "next/link";

export default function MyJobNotFound() {
    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                    Assigned job not found
                </h1>

                <p className="mt-3 text-slate-600">
                    The job does not exist or is not assigned to your Technician
                    profile.
                </p>

                <Link
                    href="/my-jobs"
                    className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Back to My Jobs
                </Link>
            </section>
        </main>
    );
}