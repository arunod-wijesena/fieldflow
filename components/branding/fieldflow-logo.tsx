import Link from "next/link";

type FieldFlowLogoProps = {
    href?: string;
    variant?: "light" | "dark";
    showText?: boolean;
    className?: string;
};

export function FieldFlowLogo({
    href = "/",
    variant = "light",
    showText = true,
    className = "",
}: FieldFlowLogoProps) {
    const textColor =
        variant === "dark" ? "text-white" : "text-slate-950";

    const taglineColor =
        variant === "dark"
            ? "text-blue-200"
            : "text-slate-500";

    const content = (
        <>
            <span
                className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/20"
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 48 48"
                    className="size-8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 10.5H35.5"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    <path
                        d="M12 10.5V37"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    <path
                        d="M12 24H29"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    <path
                        d="M32 30L38 36L32 42"
                        stroke="#BFDBFE"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>

            {showText ? (
                <span className="min-w-0">
                    <span
                        className={`block text-xl font-bold tracking-tight ${textColor}`}
                    >
                        FieldFlow
                    </span>

                    <span
                        className={`block text-xs font-medium ${taglineColor}`}
                    >
                        Field Service Management
                    </span>
                </span>
            ) : null}
        </>
    );

    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-3 ${className}`}
        >
            {content}
        </Link>
    );
}