import { Link, useLocation } from "wouter";
import { Search, Building2, Server, Info } from "lucide-react";

const navItems = [
  { href: "/", label: "데이터셋 검색", icon: Search },
  { href: "/organizations", label: "조직", icon: Building2 },
  { href: "/dataservices", label: "API 서비스", icon: Server },
  { href: "/about", label: "소개", icon: Info },
];

export function Nav() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground font-bold text-lg">
              FR
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">프랑스 공공데이터 탐색 🇫🇷</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
