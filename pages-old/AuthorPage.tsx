import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from 'lucide-react';
import CategoryArticleItem from '@/components/CategoryArticleItem';
import CategoryPagination from '@/components/CategoryPagination';
import { pb } from '@/lib/pb';
import { getPbFileUrl } from '@/lib/pbFiles';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Article } from '@/data/mockData';

const ITEMS_PER_PAGE = 10;

type PbUser = {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    created?: string;
};

type PbArticle = {
    id: string;
    slug?: string;
    title_vi?: string;
    title_jp?: string;
    sapo_vi?: string;
    sapo_jp?: string;
    thumbnail?: string;
    publishedAt?: string;
    created?: string;
    readingMinutes?: number;
    category?: string;
    expand?: {
        category?: {
            slug?: string;
            name_vi?: string;
            name_jp?: string;
            name?: string;
        };
    };
};

const AuthorPage = () => {
    const { name } = useParams<{ name: string }>();
    const decodedName = decodeURIComponent(name || '');
    const { language } = useLanguage();

    const no = (vi: string, jp: string) => (language === 'JP' ? jp : vi);

    const [author, setAuthor] = useState<PbUser | null>(null);
    const [authorLoading, setAuthorLoading] = useState(true);
    const [authorError, setAuthorError] = useState<string | null>(null);

    const [articles, setArticles] = useState<Article[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const reqIdRef = useRef(0);

    // Fetch author by name
    useEffect(() => {
        const run = async () => {
            if (!decodedName) return;
            setAuthorLoading(true);
            setAuthorError(null);
            try {
                const escapedName = decodedName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                const res = await pb.collection('users').getList<PbUser>(1, 1, {
                    filter: `name = "${escapedName}"`,
                });
                if (res.items?.[0]) {
                    setAuthor(res.items[0]);
                } else {
                    setAuthor(null);
                    setAuthorError('not_found');
                }
            } catch {
                setAuthor(null);
                setAuthorError('error');
            } finally {
                setAuthorLoading(false);
            }
        };
        setCurrentPage(1);
        run();
    }, [decodedName]);

    // Fetch articles by author
    useEffect(() => {
        const run = async () => {
            if (!author) return;
            const reqId = ++reqIdRef.current;
            setArticlesLoading(true);
            try {
                const escapedId = author.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                const filter = `status="published" && author="${escapedId}"`;
                const res = await pb.collection('articles').getList<PbArticle>(currentPage, ITEMS_PER_PAGE, {
                    filter,
                    sort: '-publishedAt,-created',
                });

                if (reqId !== reqIdRef.current) return;

                const readTimeLabel = language === 'JP' ? '分' : 'phút đọc';
                const mapped = (res.items || []).map((a) => {
                    const title = language === 'JP' ? (a.title_jp || a.title_vi || '') : (a.title_vi || a.title_jp || '');
                    const summary = language === 'JP' ? (a.sapo_jp || a.sapo_vi || '') : (a.sapo_vi || a.sapo_jp || '');
                    const dateStr = a.publishedAt || a.created || '';
                    const date = dateStr ? new Date(dateStr).toLocaleDateString(language === 'JP' ? 'ja-JP' : 'vi-VN') : '';
                    const mins = typeof a.readingMinutes === 'number' ? a.readingMinutes : 0;
                    const readTime = mins > 0 ? (language === 'JP' ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : '';
                    const image = getPbFileUrl(a, a.thumbnail) || '';
                    const cat = a.expand?.category;
                    const categoryLabel = cat
                        ? (language === 'JP' ? (cat.name_jp || cat.name_vi || cat.name || '') : (cat.name_vi || cat.name_jp || cat.name || ''))
                        : '';
                    return {
                        id: a.slug || a.id,
                        title: title || '(Untitled)',
                        summary,
                        category: categoryLabel,
                        image,
                        author: author.name || '',
                        date,
                        readTime,
                    } satisfies Article;
                });

                setArticles(mapped);
                setTotalPages(Math.max(1, res.totalPages || 1));
                setTotalItems(res.totalItems || 0);
            } catch {
                if (reqId !== reqIdRef.current) return;
                setArticles([]);
                setTotalPages(1);
                setTotalItems(0);
            } finally {
                if (reqId !== reqIdRef.current) return;
                setArticlesLoading(false);
            }
        };

        if (!author) {
            setArticles([]);
            setTotalPages(1);
            setTotalItems(0);
            setArticlesLoading(false);
            return;
        }
        run();
    }, [author, currentPage, language]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const authorAvatarUrl = author?.avatar
        ? (getPbFileUrl(author, author.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'U')}&background=random`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(decodedName || 'U')}&background=random`;

    const authorDisplayName = author?.name || decodedName;
    const joinedDate = author?.created
        ? new Date(author.created).toLocaleDateString(language === 'JP' ? 'ja-JP' : 'vi-VN', { year: 'numeric', month: 'long' })
        : '';

    // Loading state
    if (authorLoading) {
        return (
            <div className="min-h-screen bg-background font-sans">
                <Header />
                <main className="container mx-auto px-4 py-12">
                    <p className="text-muted-foreground">{no('Đang tải...', '読み込み中…')}</p>
                </main>
                <Footer />
            </div>
        );
    }

    // Not found state
    if (!author || authorError === 'not_found') {
        return (
            <div className="min-h-screen bg-background font-sans">
                <Header />
                <main className="container mx-auto px-4 py-12">
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        {no('Không tìm thấy tác giả', '著者が見つかりません')}
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        {no('Tác giả bạn tìm kiếm không tồn tại.', 'お探しの著者は存在しません。')}
                    </p>
                    <Link to="/" className="mt-4 inline-block text-foreground underline hover:text-muted-foreground">
                        {no('Quay về trang chủ', 'ホームに戻る')}
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Author Profile Header */}
                <div className="max-w-4xl mx-auto mb-12">
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                                    <AvatarImage src={authorAvatarUrl} alt={authorDisplayName} className="object-cover" />
                                    <AvatarFallback className="text-2xl">{authorDisplayName.charAt(0)}</AvatarFallback>
                                </Avatar>

                                <div className="text-center md:text-left flex-1">
                                    <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                                        {authorDisplayName}
                                    </h1>
                                    {author.role && (
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
                                            {author.role}
                                        </span>
                                    )}

                                    {joinedDate && (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{no('Tham gia', '参加日')}: {joinedDate}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator className="mb-12" />

                {/* Articles List */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                        {no(`Bài viết của ${authorDisplayName}`, `${authorDisplayName}の記事`)}
                        <span className="text-sm font-sans font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {totalItems}
                        </span>
                    </h2>

                    <div className="divide-y divide-dotted divide-border">
                        {articlesLoading ? (
                            <div className="py-6 text-sm text-muted-foreground italic">{no('Đang tải...', '読み込み中…')}</div>
                        ) : articles.length > 0 ? (
                            articles.map(article => (
                                <CategoryArticleItem key={article.id} article={article} />
                            ))
                        ) : (
                            <p className="py-6 text-muted-foreground italic">
                                {no('Tác giả này chưa có bài viết nào.', 'この著者にはまだ記事がありません。')}
                            </p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <CategoryPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </main>

            <Footer />
            <BackToTopButton />
        </div>
    );
};

export default AuthorPage;
