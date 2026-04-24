import { ReactNode } from "react";
import { Nav } from "./nav";
import { AIChat } from "@/components/ai-chat";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background font-sans">
      <Nav />
      <main className="flex-1 flex flex-col w-full">{children}</main>
      <AIChat />
    </div>
  );
}
