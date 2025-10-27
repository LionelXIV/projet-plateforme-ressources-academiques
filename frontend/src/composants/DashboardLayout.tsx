import { Outlet, NavLink, Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, LayoutDashboard, FilePlus2, Sparkles, Search, Bell, UserCircle2, LogOut } from "lucide-react";
import React from "react";

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: any;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${
          isActive
            ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

function Topbar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = React.useState(params.get("q") ?? "");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Recherche */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(value ? `/?q=${encodeURIComponent(value)}` : "/");
          }}
          className="relative flex-1 max-w-lg"
        >
          <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-full border border-slate-300 bg-white pl-10 pr-12 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Rechercher par code de cours, titre ou auteur..."
          />
        </form>

        {/* Boutons de droite */}
        <div className="flex items-center gap-2 ml-4">
          <button className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <Link
            to="/admin"
            className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <UserCircle2 className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">
              Plateforme UQAR
            </h1>
            <p className="text-xs text-slate-500">Ressources académiques</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <p className="text-xs font-semibold text-slate-500 mb-2">NAVIGATION</p>
          <NavItem to="/" label="Accueil" icon={LayoutDashboard} />
          <p className="text-xs font-semibold text-slate-500 mt-4 mb-2">ADMIN</p>
          <NavItem to="/admin/publier" label="Publier un contenu" icon={FilePlus2} />
          <NavItem to="/admin" label="Tableau de bord" icon={BookOpen} />
        </nav>

        {/* Déconnexion (mock) */}
        <button className="flex items-center gap-2 px-6 py-4 text-sm text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-all">
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
