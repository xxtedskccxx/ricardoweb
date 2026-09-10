import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCounts() {
  const supabase = await createSupabaseServerClient();

  const statuses = ["AVAILABLE", "DRAFT", "RESERVED", "SOLD"] as const;
  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return [status, count ?? 0] as const;
    }),
  );

  const { data: recent } = await supabase
    .from("products")
    .select("id, title, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  return { counts: Object.fromEntries(counts), recent: recent ?? [] };
}

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponibles",
  DRAFT: "Borradores",
  RESERVED: "Reservados",
  SOLD: "Vendidos",
};

export default async function AdminDashboardPage() {
  const { counts, recent } = await getCounts();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-ink)]">
          Panel
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Resumen de tu inventario.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(STATUS_LABEL).map(([status, label]) => (
          <div
            key={status}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <p className="text-3xl font-display text-[var(--color-ink)]">
              {counts[status] ?? 0}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Editado recientemente
        </h2>
        {recent.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="flex items-center justify-between rounded-[var(--radius-md)] px-2 py-2 text-sm hover:bg-[var(--color-bone)]"
                >
                  <span className="text-[var(--color-ink)]">
                    {product.title}
                  </span>
                  <span className="text-[var(--color-ink-muted)]">
                    {STATUS_LABEL[product.status] ?? product.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Aún no hay productos.
          </p>
        )}
      </div>

      <div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-olive)] px-5 text-sm font-medium text-[var(--color-ivory)]"
        >
          Crear producto
        </Link>
      </div>
    </div>
  );
}
