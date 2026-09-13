import Link from "next/link";
import type { Route } from "next";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-olive)] text-[var(--color-ivory)] shadow-[0_8px_18px_rgba(36,64,44,.14)] hover:-translate-y-px hover:bg-[var(--color-olive-strong)] hover:shadow-[0_12px_24px_rgba(36,64,44,.2)]",
  secondary:
    "bg-transparent border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:-translate-y-px hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)]",
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
