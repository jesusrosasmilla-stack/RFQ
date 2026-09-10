"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const operatorLinks = [
  { href: "/captura/amarilla", label: "Línea Amarilla" },
  { href: "/captura/blanca", label: "Volquetes" },
];

const adminLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/captura/amarilla", label: "Línea Amarilla" },
  { href: "/captura/blanca", label: "Volquetes" },
  { href: "/admin/planificacion", label: "Planificación" },
  { href: "/admin/registros", label: "Registros" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/equipos", label: "Equipos" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname === "/login" || status !== "authenticated" || !session) {
    return null;
  }

  const links = session.user.role === "ADMIN" ? adminLinks : operatorLinks;

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <Link href="/" className="font-semibold text-amber-400 shrink-0">
          Control de Productividad
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md hover:bg-slate-700 ${
                pathname === l.href ? "bg-slate-700 text-amber-300" : "text-slate-200"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <span className="text-slate-300">
            {session.user.name} · {session.user.role === "ADMIN" ? "Administrador" : "Operador"}
            {session.user.role === "OPERATOR" && !session.user.active && (
              <span className="ml-2 text-red-400 font-medium">(sin acceso)</span>
            )}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
