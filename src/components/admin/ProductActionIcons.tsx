interface IconProps {
  className?: string;
}

export function EditIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

export function EyeOffIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
      <path d="M9.88 4.24A9.4 9.4 0 0 1 12 4c5 0 8.27 3.11 9.5 5.5a10.2 10.2 0 0 1-4.17 4.17" />
      <path d="M6.61 6.61A10.7 10.7 0 0 0 2.5 9.5C3.73 11.89 7 15 12 15a9.3 9.3 0 0 0 2.12-.24" />
    </svg>
  );
}
