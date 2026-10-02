"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "~/lib/supabase/client";
import { LogOut, ChevronDown, IdCard, Mail } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial user session
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!user) return null;

  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all"
        style={{
          border: "1px solid var(--border-glass)",
          background: "var(--bg-glass)",
          color: "var(--text-secondary)",
        }}
        title="User menu"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate text-xs font-medium text-white sm:max-w-[160px]">
          {displayName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl"
          style={{
            border: "1px solid var(--border-glass)",
            background: "var(--bg-dropdown)",
          }}
        >
          {/* User Info Header */}
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
              <Mail className="h-3.5 w-3.5 shrink-0 text-violet-400" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
              <IdCard className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate" title={user.id}>
                ID: {user.id.slice(0, 18)}...
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
