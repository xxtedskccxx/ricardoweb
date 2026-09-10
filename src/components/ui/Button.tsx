import Link from "next/link";
import type { Route } from "next";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-olive)] text-[var(--color-ivory)] hover:bg-[var(--color-olive-strong)]",
  secondary:
    "bg-transparent border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:bg-[var(--color-bone)]",
  ghost: "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-bone)]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm min-h-[44px]",
  lg: "h-12 px-6 text-base min-h-[44px]",
};

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}

interface LinkButtonProps {
  href: Route | string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  children,
}: LinkButtonProps) {
  const classes = cx(base, variants[variant], sizes[size], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  );
}
