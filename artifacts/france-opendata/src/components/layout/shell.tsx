import { ReactNode } from "react";
import { Nav } from "./nav";
import { Github, ExternalLink } from "lucide-react";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background font-sans">
      <Nav />
      <main className="flex-1 flex flex-col w-full">{children}</main>
      <footer className="border-t bg-muted/20 py-4 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            데이터 출처:{" "}
            <a
              href="https://www.data.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              data.gouv.fr
            </a>{" "}
          
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/etalab/data.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              data.gouv.fr on GitHub
            </a>
            <a
              href="https://www.minimaxi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Minimax AI
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
