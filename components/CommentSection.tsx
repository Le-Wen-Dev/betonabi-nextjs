'use client';

import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { listReplies, listTopLevelComments, createComment, type CommentRecord } from "@/lib/comments";
import { toast } from "@/components/ui/use-toast";
import DOMPurify from "isomorphic-dompurify";
import { localePath } from "@/lib/navigation";

const MAX_COMMENT_LENGTH = 5000;
const RATE_LIMIT_MS = 5000; // 5 seconds between comments

interface CommentSectionProps {
    articleId: string;
}

const TOP_LEVEL_PER_PAGE = 10;
const REPLIES_PER_PAGE = 5;

function toMs(iso?: string) {
    const ms = iso ? Date.parse(iso) : 0;
    return Number.isFinite(ms) ? ms : 0;
}

function getErrorMessage(err: unknown) {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") return m;
    }
    try {
        const anyErr = err as any;
        const msg = anyErr?.response?.data?.message || anyErr?.data?.message;
        if (typeof msg === "string" && msg) return msg;
    } catch {
        // ignore
    }
    return null;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
    const lastSubmitRef = useRef(0); // rate limiting
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'vi';

    const [comments, setComments] = useState<CommentRecord[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [repliesOpen, setRepliesOpen] = useState<Record<string, boolean>>({});
    const [repliesByParent, setRepliesByParent] = useState<Record<string, CommentRecord[]>>({});
    const [repliesPage, setRepliesPage] = useState<Record<string, number>>({});
    const [repliesTotalPages, setRepliesTotalPages] = useState<Record<string, number>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

    React.useEffect(() => {
        const run = async () => {
            setLoading(true);
            setLoadingMore(false);
            setPage(1);
            setTotalPages(1);
            setRepliesOpen({});
            setRepliesByParent({});
            setRepliesPage({});
            setRepliesTotalPages({});
            setLoadingReplies({});
            setReplyTo(null);
            setReplyDraft("");
            try {
                const res = await listTopLevelComments({ articleId, page: 1, perPage: TOP_LEVEL_PER_PAGE });
                const sorted = (res.items || []).slice().sort((a, b) => toMs(b.created) - toMs(a.created));
                setComments(sorted);
                setTotalPages(Math.max(1, res.totalPages || 1));
            } catch (err: unknown) {
                setComments([]);
                setTotalPages(1);
                toast({
                    title: no("Không tải được bình luận", "コメントを読み込めません"),
                    description: getErrorMessage(err) || undefined,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [articleId, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newComment.trim();
        if (!user || !content) return;
        if (content.length > MAX_COMMENT_LENGTH) {
            toast({ title: no("Bình luận quá dài", "コメントが長すぎます"), description: no(`Tối đa ${MAX_COMMENT_LENGTH} ký tự.`, `最大${MAX_COMMENT_LENGTH}文字です。`), variant: "destructive" });
            return;
        }
        const now = Date.now();
        if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
            toast({ title: no("Vui lòng chờ", "お待ちください"), description: no("Bạn đang gửi quá nhanh.", "送信が速すぎます。"), variant: "destructive" });
            return;
        }
        try {
            lastSubmitRef.current = now;
            const created = await createComment({ articleId, userId: user.id, content });
            setComments((prev) => [created, ...prev]);
            setNewComment("");
        } catch (err: unknown) {
            toast({
                title: no("Gửi bình luận thất bại", "コメント送信に失敗しました"),
                description: getErrorMessage(err) || undefined,
                variant: "destructive",
            });
        }
    };

    const onLoadMore = async () => {
        if (loadingMore) return;
        if (page >= totalPages) return;
        const next = page + 1;
        setLoadingMore(true);
        try {
            const res = await listTopLevelComments({ articleId, page: next, perPage: TOP_LEVEL_PER_PAGE });
            const sorted = (res.items || []).slice().sort((a, b) => toMs(b.created) - toMs(a.created));
            setComments((prev) => [...prev, ...sorted]);
            setPage(next);
            setTotalPages(Math.max(1, res.totalPages || 1));
        } catch (err: unknown) {
            toast({
                title: no("Không tải thêm được", "さらに読み込めません"),
                description: getErrorMessage(err) || undefined,
                variant: "destructive",
            });
        } finally {
            setLoadingMore(false);
        }
    };

    const toggleReplies = async (parentId: string) => {
        const open = !!repliesOpen[parentId];
        const nextOpen = !open;
        setRepliesOpen((m) => ({ ...m, [parentId]: nextOpen }));
        if (!nextOpen) return;
        if (repliesByParent[parentId]?.length) return;
        await loadReplies(parentId, 1);
    };

    const loadReplies = async (parentId: string, nextPage: number) => {
        if (loadingReplies[parentId]) return;
        setLoadingReplies((m) => ({ ...m, [parentId]: true }));
        try {
            const res = await listReplies({ articleId, parentId, page: nextPage, perPage: REPLIES_PER_PAGE });
            const sorted = (res.items || []).slice().sort((a, b) => toMs(a.created) - toMs(b.created));
            setRepliesByParent((m) => ({ ...m, [parentId]: nextPage === 1 ? sorted : [...(m[parentId] || []), ...sorted] }));
            setRepliesPage((m) => ({ ...m, [parentId]: nextPage }));
            setRepliesTotalPages((m) => ({ ...m, [parentId]: Math.max(1, res.totalPages || 1) }));
        } catch (err: unknown) {
            toast({
                title: no("Không tải được phản hồi", "返信を読み込めません"),
                description: getErrorMessage(err) || undefined,
                variant: "destructive",
            });
        } finally {
            setLoadingReplies((m) => ({ ...m, [parentId]: false }));
        }
    };

    const submitReply = async (parentId: string) => {
        if (!user) return;
        const content = replyDraft.trim();
        if (!content) return;
        if (content.length > MAX_COMMENT_LENGTH) {
            toast({ title: no("Phản hồi quá dài", "返信が長すぎます"), description: no(`Tối đa ${MAX_COMMENT_LENGTH} ký tự.`, `最大${MAX_COMMENT_LENGTH}文字です。`), variant: "destructive" });
            return;
        }
        const now = Date.now();
        if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
            toast({ title: no("Vui lòng chờ", "お待ちください"), description: no("Bạn đang gửi quá nhanh.", "送信が速すぎます。"), variant: "destructive" });
            return;
        }
        try {
            lastSubmitRef.current = now;
            const created = await createComment({ articleId, userId: user.id, content, parentId });
            setRepliesByParent((m) => ({ ...m, [parentId]: [...(m[parentId] || []), created] }));
            setRepliesOpen((m) => ({ ...m, [parentId]: true }));
            setReplyTo(null);
            setReplyDraft("");
        } catch (err: unknown) {
            toast({
                title: no("Trả lời thất bại", "返信に失敗しました"),
                description: getErrorMessage(err) || undefined,
                variant: "destructive",
            });
        }
    };

    const totalCountLabel = useMemo(() => {
        // We only know loaded top-level count (and loaded replies). Keep it simple.
        return comments.length;
    }, [comments.length]);

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold mb-6 font-serif">
                {language === 'VN' ? 'Bình luận' : 'Comments'} ({totalCountLabel})
            </h3>

            {/* Comment Form */}
            <div className="mb-8 p-6 bg-muted/30 rounded-lg">
                {user ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-4">
                            <Avatar>
                                <AvatarFallback>{(user.name || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={language === 'VN' ? 'Viết bình luận của bạn...' : 'Write your comment...'}
                                    className="mb-3 bg-background"
                                />
                                <Button type="submit" disabled={!newComment.trim()}>
                                    {language === 'VN' ? 'Gửi bình luận' : 'Post Comment'}
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                            {language === 'VN' ? 'Vui lòng đăng nhập để bình luận' : 'Please log in to leave a comment'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" asChild>
                                <Link href={localePath(locale, '/login')}>
                                    {language === 'VN' ? 'Đăng nhập' : 'Login'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => {
                    const displayName =
                        comment.expand?.user?.name ||
                        comment.expand?.user?.email ||
                        (language === "VN" ? "Người dùng" : "User");
                    const createdAt = comment.created || "";
                    const open = !!repliesOpen[comment.id];
                    const rs = repliesByParent[comment.id] || [];
                    const rp = repliesPage[comment.id] || 1;
                    const rtp = repliesTotalPages[comment.id] || 1;
                    const rLoading = !!loadingReplies[comment.id];
                    return (
                        <div key={comment.id} className="space-y-3">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarFallback>{(displayName || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{displayName}</span>
                                        {createdAt ? (
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-foreground/90 whitespace-pre-wrap">{DOMPurify.sanitize(comment.content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="px-2"
                                            onClick={() => toggleReplies(comment.id)}
                                        >
                                            {open ? no("Ẩn phản hồi", "返信を隠す") : no("Xem phản hồi", "返信を見る")}
                                        </Button>
                                        {user ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="px-2"
                                                onClick={() => {
                                                    setReplyTo(comment.id);
                                                    setReplyDraft("");
                                                }}
                                            >
                                                {no("Trả lời", "返信")}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Reply box */}
                            {replyTo === comment.id ? (
                                <div className="ml-12 bg-muted/20 rounded-lg p-4">
                                    <Textarea
                                        value={replyDraft}
                                        onChange={(e) => setReplyDraft(e.target.value)}
                                        placeholder={no("Viết phản hồi...", "返信を書く…")}
                                        className="bg-background mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" onClick={() => submitReply(comment.id)} disabled={!replyDraft.trim()}>
                                            {no("Gửi", "送信")}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                                            {no("Hủy", "キャンセル")}
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            {/* Replies */}
                            {open ? (
                                <div className="ml-12 space-y-4">
                                    {rLoading && rs.length === 0 ? (
                                        <div className="text-sm text-muted-foreground italic">{no("Đang tải...", "読み込み中…")}</div>
                                    ) : null}
                                    {rs.map((r) => {
                                        const rName =
                                            r.expand?.user?.name ||
                                            r.expand?.user?.email ||
                                            (language === "VN" ? "Người dùng" : "User");
                                        return (
                                            <div key={r.id} className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{(rName || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm">{rName}</span>
                                                        {r.created ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(r.created), { addSuffix: true })}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="text-foreground/90 text-sm whitespace-pre-wrap">{DOMPurify.sanitize(r.content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {rp < rtp ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={rLoading}
                                            onClick={() => loadReplies(comment.id, rp + 1)}
                                        >
                                            {rLoading ? no("Đang tải...", "読み込み中…") : no("Xem thêm phản hồi", "もっと返信を見る")}
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    );
                })}

                {!loading && comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8 italic">
                        {language === 'VN' ? 'Chưa có bình luận nào. Hãy là người đầu tiên!' : 'No comments yet. Be the first!'}
                    </p>
                )}

                {loading ? (
                    <p className="text-center text-muted-foreground py-8 italic">
                        {no("Đang tải...", "読み込み中…")}
                    </p>
                ) : null}

                {!loading && page < totalPages ? (
                    <div className="pt-2">
                        <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
                            {loadingMore ? no("Đang tải...", "読み込み中…") : no("Xem thêm bình luận", "もっとコメントを見る")}
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CommentSection;
