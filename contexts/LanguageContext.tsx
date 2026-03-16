'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { localeToLang } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export type Language = 'VN' | 'JP';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
    VN: {
        "search": "Tìm kiếm",
        "signIn": "Đăng nhập",
        "date_format": "dd/MM/yyyy",
        "readTime": "phút đọc",
        "latestNews": "Tin mới nhất",
        "editorsPick": "Lựa chọn của biên tập viên",
        "recommended": "Đề xuất cho bạn",
        "viewMore": "Xem thêm",
        "copyright": "Bản quyền thuộc về Betonabi",
        "category_Business": "Kinh doanh",
        "category_Politics": "Chính trị",
        "category_Society": "Xã hội",
        "category_Sports": "Thể thao",
        "category_Culture": "Văn hóa",
        "category_Travel": "Du lịch",
        "category_Health": "Sức khỏe",
        "category_Education": "Giáo dục",
        "category_Life": "Đời sống",
        "category_TravelCulture": "Du lịch - Văn hóa",
        "home_title": "Betonabi",
        "hot_topics": "Chủ đề nổi bật",
        "follow_us": "Theo dõi chúng tôi",
        "most_viewed": "Xem nhiều nhất",
        "footer_about": "Trang tin tức uy tín hàng đầu Việt Nam. Cập nhật tin tức mới nhất 24/7.",
        "footer_categories": "Chuyên mục",
        "footer_services": "Dịch vụ",
        "footer_subscribe": "Đăng ký",
        "footer_subscribe_btn": "Đăng ký",
        "footer_ads": "Quảng cáo",
        "footer_contact": "Liên hệ",
        "footer_terms": "Điều khoản sử dụng",
        "footer_get_latest": "Nhận tin mới nhất",
        "footer_subscribe_text": "Đăng ký để nhận tin tức nóng hổi mỗi ngày.",
        "footer_email_placeholder": "Email của bạn",
        "footer_rights": "© 2025 Betonabi. Bảo lưu mọi quyền.",
        "footer_built": "Được xây dựng với ❤️ tại Việt Nam",
        "loading": "Đang tải...",
        "not_found_article": "Không tìm thấy bài viết",
        "not_found_article_desc": "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
        "back_home": "Về trang chủ",
        "home": "Trang chủ",
        "category": "Danh mục",
        "article_detail": "Chi tiết bài viết",
        "no_title": "(Chưa có tiêu đề)",
        "saved": "Đã lưu",
        "save_article": "Lưu bài viết",
        "not_found_category": "Không tìm thấy chuyên mục",
        "not_found_category_desc": "Chuyên mục bạn tìm kiếm không tồn tại.",
        "no_articles": "Không có bài viết.",
        "most_viewed_sidebar": "Đọc nhiều",
        "related_category": "Tin cùng chuyên mục",
        "dashboard": "Bảng điều khiển",
        "logout": "Đăng xuất",
        "welcome_back": "Chào mừng trở lại",
        "manage_activity": "Quản lý hoạt động đọc của bạn.",
        "saved_articles": "Bài đã lưu",
        "saved_articles_desc": "Bài viết bạn đã lưu",
        "your_comments": "Bình luận của bạn",
        "your_comments_count": "Số bình luận bạn đã đăng",
        "settings": "Cài đặt",
        "manage_account": "Quản lý tài khoản",
        "saved_articles_list": "Danh sách bài đã lưu",
        "no_saved_articles": "Chưa có bài viết đã lưu.",
        "no_comments": "Chưa có bình luận nào.",
        "loading_article": "Đang tải bài viết...",
        "newsletter_success": "Đăng ký thành công!",
        "newsletter_success_desc": "Cảm ơn bạn đã đăng ký nhận tin.",
        "newsletter_invalid_email": "Vui lòng nhập email hợp lệ.",
        "save": "Lưu",
        "share": "Chia sẻ",
        "tags": "Tags"
    },
    JP: {
        "search": "検索",
        "signIn": "ログイン",
        "date_format": "yyyy/MM/dd",
        "readTime": "分",
        "latestNews": "最新ニュース",
        "editorsPick": "編集長のおすすめ",
        "recommended": "おすすめ",
        "viewMore": "もっと見る",
        "copyright": "© Betonabi",
        "category_Business": "ビジネス",
        "category_Politics": "政治",
        "category_Society": "社会",
        "category_Sports": "スポーツ",
        "category_Culture": "文化",
        "category_Travel": "旅行",
        "category_Health": "健康",
        "category_Education": "教育",
        "category_Life": "ライフ",
        "category_TravelCulture": "旅行・文化",
        "home_title": "ミ・チ・ライター",
        "hot_topics": "注目ワード",
        "follow_us": "フォローする",
        "most_viewed": "アクセスランキング",
        "footer_about": "ベトナム有数の信頼できるニュースサイト。最新ニュースを24時間年中無休で更新。",
        "footer_categories": "カテゴリー",
        "footer_services": "サービス",
        "footer_subscribe": "登録",
        "footer_subscribe_btn": "登録する",
        "footer_ads": "広告",
        "footer_contact": "お問い合わせ",
        "footer_terms": "利用規約",
        "footer_get_latest": "最新ニュースを受け取る",
        "footer_subscribe_text": "毎日最新のニュースを受け取るために登録してください。",
        "footer_email_placeholder": "メールアドレス",
        "footer_rights": "© 2025 Betonabi. 全著作権所有。",
        "footer_built": "ベトナムで❤️を込めて作られました",
        "loading": "読み込み中…",
        "not_found_article": "記事が見つかりません",
        "not_found_article_desc": "お探しの記事は存在しないか、削除されました。",
        "back_home": "ホームに戻る",
        "home": "ホーム",
        "category": "カテゴリー",
        "article_detail": "記事詳細",
        "no_title": "(タイトルなし)",
        "saved": "保存済み",
        "save_article": "保存",
        "not_found_category": "カテゴリーが見つかりません",
        "not_found_category_desc": "お探しのカテゴリーは存在しません。",
        "no_articles": "記事がありません。",
        "most_viewed_sidebar": "アクセスランキング",
        "related_category": "関連記事",
        "dashboard": "ダッシュボード",
        "logout": "ログアウト",
        "welcome_back": "おかえりなさい",
        "manage_activity": "読書の活動を管理します。",
        "saved_articles": "保存した記事",
        "saved_articles_desc": "ブックマークした記事",
        "your_comments": "あなたのコメント",
        "your_comments_count": "投稿したコメント数",
        "settings": "設定",
        "manage_account": "アカウント管理",
        "saved_articles_list": "保存した記事一覧",
        "no_saved_articles": "保存した記事はありません。",
        "no_comments": "コメントはありません。",
        "loading_article": "記事を読み込み中…",
        "newsletter_success": "登録完了！",
        "newsletter_success_desc": "ニュースレターにご登録いただきありがとうございます。",
        "newsletter_invalid_email": "有効なメールアドレスを入力してください。",
        "save": "保存して後で読む",
        "share": "シェア",
        "tags": "関連ワード"
    }
};

export const LanguageProvider = ({ children, locale }: { children: ReactNode; locale: Locale }) => {
    const language: Language = localeToLang[locale];

    const setLanguage = (lang: Language) => {
        const newLocale = lang === 'VN' ? 'vi' : 'ja';
        document.cookie = `betonabi_locale=${newLocale}; path=/; max-age=31536000`;
        // Replace the locale segment in the current path
        const segments = window.location.pathname.split('/');
        segments[1] = newLocale;
        window.location.href = segments.join('/') || `/${newLocale}`;
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
