import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, MessageSquare, Settings } from 'lucide-react';
import { countSavedArticles, listSavedArticles, type SavedArticleRecord } from '@/lib/savedArticles';
import { countUserComments, listUserComments, type CommentRecord } from '@/lib/comments';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

const UserDashboard = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [savedCount, setSavedCount] = useState<number>(0);
    const [commentCount, setCommentCount] = useState<number>(0);

    const SAVED_PER_PAGE = 10;
    const COMMENTS_PER_PAGE = 10;

    const [savedItems, setSavedItems] = useState<SavedArticleRecord[]>([]);
    const [savedPage, setSavedPage] = useState(1);
    const [savedTotalPages, setSavedTotalPages] = useState(1);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedLoadingMore, setSavedLoadingMore] = useState(false);

    const [myComments, setMyComments] = useState<CommentRecord[]>([]);
    const [commentPage, setCommentPage] = useState(1);
    const [commentTotalPages, setCommentTotalPages] = useState(1);
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentLoadingMore, setCommentLoadingMore] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!user?.id) return;
            try {
                const [s, c] = await Promise.all([
                    countSavedArticles({ userId: user.id }),
                    countUserComments({ userId: user.id }),
                ]);
                setSavedCount(s);
                setCommentCount(c);
            } catch {
                // ignore
            }
        };
        run();
    }, [user?.id]);

    useEffect(() => {
        const run = async () => {
            if (!user?.id) return;
            setSavedLoading(true);
            setCommentLoading(true);
            try {
                const [savedRes, commentRes] = await Promise.all([
                    listSavedArticles({ userId: user.id, page: 1, perPage: SAVED_PER_PAGE }),
                    listUserComments({ userId: user.id, page: 1, perPage: COMMENTS_PER_PAGE }),
                ]);
                setSavedItems(savedRes.items || []);
                setSavedPage(1);
                setSavedTotalPages(Math.max(1, savedRes.totalPages || 1));

                setMyComments(commentRes.items || []);
                setCommentPage(1);
                setCommentTotalPages(Math.max(1, commentRes.totalPages || 1));
            } catch {
                setSavedItems([]);
                setSavedPage(1);
                setSavedTotalPages(1);
                setMyComments([]);
                setCommentPage(1);
                setCommentTotalPages(1);
            } finally {
                setSavedLoading(false);
                setCommentLoading(false);
            }
        };
        run();
    }, [user?.id]);

    const loadMoreSaved = async () => {
        if (!user?.id) return;
        if (savedLoadingMore) return;
        if (savedPage >= savedTotalPages) return;
        const next = savedPage + 1;
        setSavedLoadingMore(true);
        try {
            const res = await listSavedArticles({ userId: user.id, page: next, perPage: SAVED_PER_PAGE });
            setSavedItems((prev) => [...prev, ...(res.items || [])]);
            setSavedPage(next);
            setSavedTotalPages(Math.max(1, res.totalPages || 1));
        } finally {
            setSavedLoadingMore(false);
        }
    };

    const loadMoreComments = async () => {
        if (!user?.id) return;
        if (commentLoadingMore) return;
        if (commentPage >= commentTotalPages) return;
        const next = commentPage + 1;
        setCommentLoadingMore(true);
        try {
            const res = await listUserComments({ userId: user.id, page: next, perPage: COMMENTS_PER_PAGE });
            setMyComments((prev) => [...prev, ...(res.items || [])]);
            setCommentPage(next);
            setCommentTotalPages(Math.max(1, res.totalPages || 1));
        } finally {
            setCommentLoadingMore(false);
        }
    };

    const savedList = useMemo(() => {
        return savedItems.map((s) => {
            const a = s.expand?.article;
            const title = language === "JP" ? (a?.title_jp || a?.title_vi || "") : (a?.title_vi || a?.title_jp || "");
            const slug = a?.slug || a?.id;
            const dateStr = a?.publishedAt || a?.created || s.created || "";
            const date = dateStr ? new Date(dateStr).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN") : "";
            return { id: s.id, slug, title: title || "(Untitled)", date };
        });
    }, [savedItems, language]);

    const myCommentList = useMemo(() => {
        return myComments.map((c) => {
            const a = c.expand?.article;
            const title = language === "JP" ? (a?.title_jp || a?.title_vi || a?.title || "") : (a?.title_vi || a?.title_jp || a?.title || "");
            const slug = a?.slug || a?.id;
            const time = c.created ? formatDistanceToNow(new Date(c.created), { addSuffix: true }) : "";
            return { id: c.id, slug, articleTitle: title || "(Untitled)", content: c.content, time };
        });
    }, [myComments, language]);

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t("welcome_back")}, {user?.name || 'Reader'}</h1>
                    <p className="text-muted-foreground">{t("manage_activity")}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("saved_articles")}</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{savedCount}</div>
                            <p className="text-xs text-muted-foreground">{t("saved_articles_desc")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("your_comments")}</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{commentCount}</div>
                            <p className="text-xs text-muted-foreground">{t("your_comments_count")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("settings")}</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full">{t("manage_account")}</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Saved articles list */}
                    <div className="lg:col-span-6">
                        <h2 className="font-serif text-xl font-bold mb-3">{t("saved_articles_list")}</h2>
                        <Separator className="mb-4" />
                        {savedLoading ? (
                            <div className="text-sm text-muted-foreground italic">{t("loading")}</div>
                        ) : savedList.length ? (
                            <div className="space-y-3">
                                {savedList.map((a) => (
                                    <div key={a.id} className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <Link to={`/longform/${a.slug}`} className="font-medium hover:underline line-clamp-2">
                                                {a.title}
                                            </Link>
                                            <div className="text-xs text-muted-foreground mt-1">{a.date}</div>
                                        </div>
                                        <Link to={`/longform/${a.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                            {t("viewMore")}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">{t("no_saved_articles")}</div>
                        )}

                        {!savedLoading && savedPage < savedTotalPages ? (
                            <div className="mt-4">
                                <Button variant="outline" onClick={loadMoreSaved} disabled={savedLoadingMore}>
                                    {savedLoadingMore ? t("loading") : t("viewMore")}
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {/* My comments list */}
                    <div className="lg:col-span-6">
                        <h2 className="font-serif text-xl font-bold mb-3">{t("your_comments")}</h2>
                        <Separator className="mb-4" />
                        {commentLoading ? (
                            <div className="text-sm text-muted-foreground italic">{t("loading")}</div>
                        ) : myCommentList.length ? (
                            <div className="space-y-4">
                                {myCommentList.map((c) => (
                                    <div key={c.id} className="border border-border p-4 rounded-sm">
                                        <Link to={`/longform/${c.slug}`} className="font-medium hover:underline line-clamp-2">
                                            {c.articleTitle}
                                        </Link>
                                        <div className="text-xs text-muted-foreground mt-1">{c.time}</div>
                                        <div className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4">
                                            {c.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">{t("no_comments")}</div>
                        )}

                        {!commentLoading && commentPage < commentTotalPages ? (
                            <div className="mt-4">
                                <Button variant="outline" onClick={loadMoreComments} disabled={commentLoadingMore}>
                                    {commentLoadingMore ? t("loading") : t("viewMore")}
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserDashboard;
