import Link from "next/link";

const navItems = [
  { href: "/", label: "🏠 Dashboard" },
  { href: "/players", label: "👥 Spieler" },
  { href: "/matches", label: "⚽ Spiele" },
  { href: "/seasons", label: "🏆 Wettbewerbe & Saisons" },
  { href: "/stats", label: "📊 Statistiken" },
  { href: "/taktiken", label: "🧠 Taktiken" },
  { href: "/team", label: "📈 Teamstatistik" },
  { href: "/settings", label: "⚙️ Einstellungen" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">11connect Hub</div>

      <nav className="nav">
        {navItems.map((item) => (
          <Link
            className="nav-link"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}