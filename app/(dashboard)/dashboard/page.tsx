import { SignOutButton } from "@/components/auth/sign-out-button";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-700">FieldFlow</p>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Operational statistics will be implemented after work orders.
            </p>
          </div>

          <SignOutButton />
        </div>
      </section>
    </main>
  );
}