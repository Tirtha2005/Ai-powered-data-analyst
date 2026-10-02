"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  BarChart2,
  Sparkles,
  Menu,
  X,
  Loader2,
  Clock,
  LogOut,
  Mail,
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  getUserAnalyses,
  type AnalysisSessionSummary,
} from "~/lib/supabase/result-service";
import {
  setActiveAnalysisId,
  createAnalysisSession,
  renameAnalysis,
  deleteAnalysis,
} from "~/lib/supabase/analysis-service";
import { createClient } from "~/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SidebarProps {
  activeAnalysisId: string | null;
  onSelectAnalysis: (analysisId: string) => void;
  onNewAnalysis: () => void;
}

export function Sidebar({
  activeAnalysisId,
  onSelectAnalysis,
  onNewAnalysis,
}: SidebarProps) {
  const [analyses, setAnalyses] = useState<AnalysisSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete modal state
  const [deletingItem, setDeletingItem] =
    useState<AnalysisSessionSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    const list = await getUserAnalyses();
    setAnalyses(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalyses();

    // Fetch user details
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAnalyses]);

  const handleCreateNew = async () => {
    const newId = await createAnalysisSession("New Analysis");
    if (newId) {
      void fetchAnalyses();
      onNewAnalysis();
    }
    setMobileOpen(false);
  };

  const handleSelect = (id: string) => {
    if (renamingId === id) return;
    setActiveAnalysisId(id);
    onSelectAnalysis(id);
    setMobileOpen(false);
  };

  const handleStartRename = (
    e: React.MouseEvent,
    item: AnalysisSessionSummary,
  ) => {
    e.stopPropagation();
    setRenamingId(item.id);
    setRenameValue(item.title);
  };

  const handleConfirmRename = async (analysisId: string) => {
    if (!renameValue.trim()) return;
    const ok = await renameAnalysis(analysisId, renameValue.trim());
    if (ok) {
      toast.success("Analysis renamed");
      void fetchAnalyses();
    } else {
      toast.error("Failed to rename analysis");
    }
    setRenamingId(null);
  };

  const handleStartDelete = (
    e: React.MouseEvent,
    item: AnalysisSessionSummary,
  ) => {
    e.stopPropagation();
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    const targetId = deletingItem.id;

    const ok = await deleteAnalysis(targetId);
    if (ok) {
      toast.success("Analysis deleted");
      if (activeAnalysisId === targetId) {
        onNewAnalysis();
      }
      void fetchAnalyses();
    } else {
      toast.error("Failed to delete analysis");
    }

    setIsDeleting(false);
    setDeletingItem(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col justify-between border-r border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl">
      {/* Top Header & New Analysis */}
      <div className="space-y-4">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-2 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Data Analyst</h2>
            <p className="text-[11px] text-gray-400">Workspace</p>
          </div>
        </div>

        {/* New Analysis Button */}
        <button
          onClick={handleCreateNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </button>

        {/* Recent Section Header */}
        <div className="pt-2">
          <div className="flex items-center gap-2 px-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
            <Clock className="h-3.5 w-3.5" />
            <span>Recent Analyses</span>
          </div>

          {/* List */}
          <div className="mt-2 max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : analyses.length === 0 ? (
              <div className="px-2 py-6 text-center text-xs text-gray-500">
                No recent analyses yet
              </div>
            ) : (
              analyses.map((item) => {
                const isActive = item.id === activeAnalysisId;
                const isRenaming = item.id === renamingId;

                return (
                  <div
                    key={item.id}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                      isActive
                        ? "border border-violet-500/30 bg-violet-600/20 font-medium text-violet-300"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {isRenaming ? (
                      <div className="flex w-full items-center gap-1.5">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              void handleConfirmRename(item.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                          className="w-full rounded-md border border-violet-500/50 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => void handleConfirmRename(item.id)}
                          className="rounded-md p-1 text-emerald-400 hover:bg-emerald-500/20"
                          title="Save title"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRenamingId(null)}
                          className="rounded-md p-1 text-gray-400 hover:bg-white/10"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelect(item.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <BarChart2
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-violet-400" : "text-gray-500"
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => handleStartRename(e, item)}
                            className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-violet-300"
                            title="Rename analysis"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleStartDelete(e, item)}
                            className="rounded-md p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                            title="Delete analysis"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Info Footer */}
      {user && (
        <div className="border-t border-white/10 pt-3">
          <div className="rounded-xl bg-slate-900/60 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {displayName}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Mail className="h-3 w-3 shrink-0 text-violet-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-3 left-3 z-50 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-white/10 bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur-md"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50">{sidebarContent}</div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="sticky top-0 hidden h-screen md:block">
        {sidebarContent}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-red-500/20 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-500/10 p-2 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Delete Analysis?
                </h3>
                <p className="text-xs text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                &ldquo;{deletingItem.title}&rdquo;
              </span>
              ? This will remove its messages, results, and original dataset
              file.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={() => void handleConfirmDelete()}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Analysis"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
