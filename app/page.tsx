import Link from "next/link";
import { FieldFlowLogo } from "@/components/branding/fieldflow-logo";

const features = [
  {
    title: "Customer Management",
    description:
      "Store service locations and contact details, then find Customers quickly through secure search.",
    icon: "customer",
  },
  {
    title: "Work Order Dispatch",
    description:
      "Create, prioritize, schedule, assign, filter, and review field-service Work Orders.",
    icon: "work-order",
  },
  {
    title: "Technician Workflow",
    description:
      "Give Technicians a focused My Jobs experience for starting, updating, and completing work.",
    icon: "technician",
  },
] as const;

const workflowSteps = [
  {
    number: "01",
    title: "Create and assign",
    description:
      "A Dispatcher creates a Work Order and assigns an eligible Technician.",
  },
  {
    number: "02",
    title: "Perform field work",
    description:
      "The assigned Technician starts the job and records operational progress.",
  },
  {
    number: "03",
    title: "Complete and review",
    description:
      "Completion notes and audit history become available to operational management.",
  },
] as const;

const operationalHighlights = [
  "Server-enforced role access",
  "Transaction-backed Work Order updates",
  "Timestamped operational history",
  "Responsive field-service interface",
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative isolate">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[720px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
          aria-hidden="true"
        />

        <div
          className="absolute left-[-12rem] top-24 -z-10 size-[30rem] rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute right-[-10rem] top-40 -z-10 size-[26rem] rounded-full bg-cyan-400/10 blur-3xl"
          aria-hidden="true"
        />

        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <FieldFlowLogo variant="dark" />

            <nav
              className="flex items-center gap-3"
              aria-label="Public navigation"
            >
              <a
                href="#features"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#workflow"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Workflow
              </a>

              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:pb-32">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-100">
              <span className="size-2 rounded-full bg-emerald-400" />
              Secure field-service operations
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Keep every field job{" "}
              <span className="text-blue-400">
                moving forward.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              FieldFlow brings Customers, Technicians, Work Orders,
              progress updates, completion records, and operational
              visibility into one secure workflow.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Sign in to FieldFlow
                <svg
                  viewBox="0 0 20 20"
                  className="ml-2 size-5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10H16M11 5L16 10L11 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              <a
                href="#workflow"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore the workflow
              </a>
            </div>

            <ul className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {operationalHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-3"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 10L8.2 13.2L15 6.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <DashboardPreview />
        </section>
      </div>

      <section
        id="features"
        className="bg-white px-4 py-20 text-slate-950 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
              One connected workspace
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built around real field-service operations
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              FieldFlow keeps operational teams informed while giving
              Technicians a focused interface for assigned field work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="bg-slate-100 px-4 py-20 text-slate-950 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                End-to-end workflow
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                From assignment to completion
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Every important status change is saved with the
                responsible user, timestamp, and operational note.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Open the application
              </Link>
            </div>

            <ol className="grid gap-5">
              {workflowSteps.map((step) => (
                <li
                  key={step.number}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[4rem_1fr] sm:p-6"
                >
                  <span className="flex size-14 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                    {step.number}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-blue-700 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl bg-blue-800 px-6 py-10 shadow-2xl shadow-blue-950/20 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              Ready to continue?
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              Access the FieldFlow workspace
            </h2>

            <p className="mt-3 max-w-2xl text-blue-100">
              Sign in with an authorized fictional demonstration
              account to access the role-specific workspace.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-900 shadow-md transition hover:bg-blue-50"
          >
            Sign in to FieldFlow
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <FieldFlowLogo variant="dark" />

          <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-right">
            Internship demonstration application. All demonstration
            Customers, Technicians, Work Orders, and operational notes
            use fictional data.
          </p>
        </div>
      </footer>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div className="relative min-w-0">
      <div
        className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl shadow-black/30">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-amber-400" />
          <span className="size-3 rounded-full bg-emerald-400" />

          <span className="ml-3 text-xs font-medium text-slate-500">
            FieldFlow Operations
          </span>
        </div>

        <div className="p-5 text-slate-950 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Operations overview
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Dashboard
              </h2>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Live data
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <PreviewMetric
              label="Assigned"
              value="12"
              color="blue"
            />

            <PreviewMetric
              label="In progress"
              value="7"
              color="amber"
            />

            <PreviewMetric
              label="Completed"
              value="28"
              color="green"
            />

            <PreviewMetric
              label="Available"
              value="9"
              color="slate"
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold">
                Recent Work Orders
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <PreviewJob
                title="Ventilation inspection"
                status="In progress"
                statusClass="bg-amber-100 text-amber-800"
              />

              <PreviewJob
                title="Electrical safety service"
                status="Assigned"
                statusClass="bg-blue-100 text-blue-800"
              />

              <PreviewJob
                title="Cooling system review"
                status="Completed"
                statusClass="bg-green-100 text-green-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PreviewMetricProps = {
  label: string;
  value: string;
  color: "blue" | "amber" | "green" | "slate";
};

const metricStyles = {
  blue: "border-blue-200 bg-blue-50",
  amber: "border-amber-200 bg-amber-50",
  green: "border-green-200 bg-green-50",
  slate: "border-slate-200 bg-slate-50",
} as const;

function PreviewMetric({
  label,
  value,
  color,
}: PreviewMetricProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${metricStyles[color]}`}
    >
      <p className="text-xs font-medium text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

type PreviewJobProps = {
  title: string;
  status: string;
  statusClass: string;
};

function PreviewJob({
  title,
  status,
  statusClass,
}: PreviewJobProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          Fictional service activity
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
      >
        {status}
      </span>
    </div>
  );
}

type FeatureIcon =
  | "customer"
  | "work-order"
  | "technician";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: FeatureIcon;
};

function FeatureCard({
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
      <span className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
        <FeatureIcon type={icon} />
      </span>

      <h3 className="mt-5 text-xl font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function FeatureIcon({ type }: { type: FeatureIcon }) {
  if (type === "customer") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 21V19C16 16.8 14.2 15 12 15H6C3.8 15 2 16.8 2 19V21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <circle
          cx="9"
          cy="7"
          r="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M18 8V14M21 11H15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "work-order") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="4"
          width="14"
          height="17"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M9 4.5V3.5C9 2.7 9.7 2 10.5 2H13.5C14.3 2 15 2.7 15 3.5V4.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M9 10H15M9 14H15M9 18H13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.7 6.3C14 5.6 13 5.2 12 5.2C9.9 5.2 8.2 6.9 8.2 9C8.2 10 8.6 11 9.3 11.7L3 18L6 21L12.3 14.7C13 15.4 14 15.8 15 15.8C17.1 15.8 18.8 14.1 18.8 12C18.8 11 18.4 10 17.7 9.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M15 5L19 1L23 5L19 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}