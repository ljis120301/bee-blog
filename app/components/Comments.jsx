"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pb } from "@/lib/pocketbase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const mountedRef = useRef(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const isLoggedIn = pb.authStore.isValid;
  const currentUser = pb.authStore.model;
  const isModerator = useMemo(() => {
    const role = currentUser?.role;
    return role === "admin" || role === "author";
  }, [currentUser]);

  const loadComments = useCallback(async (pageNum = 1) => {
    if (!postId) return;
    setIsLoading(true);
    setError("");
    try {
      const user = pb.authStore.model;
      const authorPart = user?.id ? ` || author = "${user.id}"` : "";
      const res = await pb.collection("comments").getList(pageNum, pageSize, {
        sort: "created",
        filter: `post = "${postId}" && (status = "published"${authorPart})`,
        expand: "author",
        $autoCancel: false,
      });
      if (!mountedRef.current) return;
      setComments(res?.items || []);
      setTotalPages(Math.max(1, res?.totalPages || 1));
      setPage(res?.page || 1);
    } catch (e) {
      if (!mountedRef.current) return;
      setError("Failed to load comments.");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    mountedRef.current = true;
    loadComments(1);
    return () => { mountedRef.current = false; };
  }, [loadComments]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Please log in to comment.");
      return;
    }
    const trimmed = (content || "").trim();
    if (trimmed.length < 3) {
      setError("Comment is too short.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const created = await pb.collection("comments").create({
        post: postId,
        author: currentUser.id,
        content: trimmed,
        status: "published",
      });
      setContent("");
      setSuccess("Comment submitted.");
      // Optimistic refresh: include own pending comment
      await loadComments(1);
    } catch (e) {
      setError(e?.message || "Failed to submit comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReportDialog = (comment) => {
    if (!isLoggedIn) {
      setError("Please log in to report comments.");
      return;
    }
    setReportTarget(comment);
    setReportReason("");
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportTarget) return;
    setReportSubmitting(true);
    try {
      await pb.collection("comment_flags").create({
        comment: reportTarget.id,
        user: currentUser.id,
        reason: (reportReason || "").slice(0, 500),
      });
      setSuccess("Report submitted.");
      setReportDialogOpen(false);
      setReportTarget(null);
    } catch (e) {
      setError(e?.message || "Failed to submit report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const openDeleteDialog = (comment) => {
    if (!isLoggedIn) return;
    const isOwner = comment?.author === currentUser?.id || comment?.expand?.author?.id === currentUser?.id;
    if (!(isOwner || isModerator)) return;
    setDeleteTarget(comment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Try hard delete first (owner allowed by PB rules). Fallback to soft delete if denied.
      try {
        await pb.collection("comments").delete(deleteTarget.id);
      } catch {
        await pb.collection("comments").update(deleteTarget.id, { status: "deleted" });
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await loadComments(page);
    } catch (e) {
      setError(e?.message || "Failed to delete comment.");
    }
  };

  return (
    <section id="comments" className="mt-10">
      <h2 className="text-xl font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mb-4">Comments</h2>

      {/* Write comment */}
      <div className="rounded-lg p-4 bg-[#F6EEE5] dark:bg-cat-frappe-base/70 border border-cat-frappe-overlay0/20 mb-6">
        {isLoggedIn ? (
          <form onSubmit={submitComment} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full min-h-[90px] rounded-md border border-cat-frappe-overlay0/30 dark:border-cat-frappe-overlay0 bg-white dark:bg-cat-frappe-surface1 p-3 text-cat-frappe-base dark:text-cat-frappe-text"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-cat-frappe-subtext0">
                Signed in as {currentUser?.username || currentUser?.email}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-cat-frappe-peach text-cat-frappe-base font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
            {error ? <p className="text-sm text-cat-frappe-red">{error}</p> : null}
            {success ? <p className="text-sm text-cat-frappe-green">{success}</p> : null}
          </form>
        ) : (
          <div className="text-sm text-cat-frappe-subtext0">
            Please <a href="/auth" className="text-cat-frappe-peach underline">log in</a> to comment.
          </div>
        )}
      </div>

      {/* List comments */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-cat-frappe-subtext0">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-cat-frappe-subtext0">No comments yet.</div>
        ) : (
          comments.map((c) => {
            const author = c.expand?.author;
            return (
              <div key={c.id} className="rounded-lg p-4 bg-[#F6EEE5] dark:bg-cat-frappe-base border border-cat-frappe-overlay0/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-cat-frappe-subtext0">
                      <span className="font-medium text-cat-frappe-base dark:text-cat-frappe-text">{author?.username || author?.email || "User"}</span>
                      <span className="ml-2">{new Date(c.created).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openReportDialog(c)} className="text-xs text-cat-frappe-mauve hover:underline">Report</button>
                    {(isModerator || (isLoggedIn && (author?.id === currentUser?.id))) && (
                      <button onClick={() => openDeleteDialog(c)} className="text-xs text-cat-frappe-red hover:underline">Delete</button>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-cat-frappe-base dark:text-cat-frappe-text whitespace-pre-wrap break-words">
                  {c.content}
                </div>
                {c.status !== 'published' && (c.author === currentUser?.id || c.expand?.author?.id === currentUser?.id) && (
                  <div className="mt-2 text-xs text-cat-frappe-yellow">Pending moderation</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            className="px-3 py-1 rounded border border-cat-frappe-overlay0/20 bg-white dark:bg-cat-frappe-surface1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => loadComments(page - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-cat-frappe-subtext0">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded border border-cat-frappe-overlay0/20 bg-white dark:bg-cat-frappe-surface1 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => loadComments(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comment</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-3 py-2 rounded border">Cancel</button>
            </DialogClose>
            <button onClick={confirmDelete} className="px-3 py-2 rounded bg-cat-frappe-red text-white">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report comment</DialogTitle>
            <DialogDescription>Tell us briefly what’s wrong with this comment.</DialogDescription>
          </DialogHeader>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full min-h-[90px] rounded-md border border-cat-frappe-overlay0/30 dark:border-cat-frappe-overlay0 bg-white dark:bg-cat-frappe-surface1 p-3 text-cat-frappe-base dark:text-cat-frappe-text"
          />
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-3 py-2 rounded border">Cancel</button>
            </DialogClose>
            <button disabled={reportSubmitting} onClick={submitReport} className="px-3 py-2 rounded bg-cat-frappe-peach text-cat-frappe-base">
              {reportSubmitting ? "Submitting..." : "Submit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}


