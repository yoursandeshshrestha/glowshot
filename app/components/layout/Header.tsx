import Link from "next/link";
import { GitHubBadge } from "../others/GitHubBadge";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#37322f]/6 bg-[#f7f5f3]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="text-[#37322f] font-semibold text-lg">
            Glowshot
          </Link>

          <div className="flex items-center gap-6">
            <GitHubBadge />

            <Link
              href="/playground"
              className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium"
            >
              Playground
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
