export default function DashboardLoading() {
    return (
        <main
            className="p-4 sm:p-6"
            aria-busy="true"
            aria-live="polite"
        >
            <section className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm">
                <span className="sr-only">Loading FieldFlow content</span>

                <div className="animate-pulse">
                    <div className="h-4 w-20 rounded bg-slate-200" />

                    <div className="mt-3 h-8 w-56 max-w-full rounded bg-slate-200" />

                    <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-slate-200 p-5"
                            >
                                <div className="h-4 w-28 rounded bg-slate-200" />
                                <div className="mt-4 h-9 w-16 rounded bg-slate-200" />
                                <div className="mt-3 h-3 w-24 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-lg border border-slate-200 p-5">
                        <div className="h-5 w-40 rounded bg-slate-200" />

                        <div className="mt-5 space-y-4">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={index}
                                    className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3"
                                >
                                    <div className="h-4 rounded bg-slate-200" />
                                    <div className="h-4 rounded bg-slate-100" />
                                    <div className="h-4 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}