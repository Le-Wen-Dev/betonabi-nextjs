'use client';

import React from 'react';
import { Facebook, Instagram, Link as LinkIcon, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { XIcon, ThreadsIcon } from './Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShareButtonsProps {
    url: string;
    title: string;
    label?: string | null;
}

const ShareButtons = ({ url, title, label }: ShareButtonsProps) => {
    const router = useRouter();
    const { t } = useLanguage();
    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'twitter':
                shareLink = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'threads':
                shareLink = `https://threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct web sharing url effectively for posts
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard (Instagram does not support web share)');
                return;
            default:
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-y-4 w-full my-4">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-gray-100 bg-white shadow-sm hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                    onClick={() => router.back()}
                    title="Quay lại"
                >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                </Button>

                <Button
                    variant="outline"
                    className="h-9 px-4 rounded-sm border-gray-100 bg-white shadow-sm font-sans text-sm font-medium text-gray-700 hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] flex items-center gap-2 transition-all active:scale-95"
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép liên kết');
                    }}
                >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span className="font-bold">{t("save")}</span>
                </Button>
            </div>

            <div className="flex items-center gap-3">
                {label !== null && (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">
                        {label || t("share")}
                    </span>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-100 flex items-center justify-center text-blue-600 hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all hover:scale-110"
                    onClick={() => handleShare('facebook')}
                    title="Share on Facebook"
                >
                    <Facebook className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-100 flex items-center justify-center text-black hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all hover:scale-110"
                    onClick={() => handleShare('twitter')}
                    title="Share on X"
                >
                    <XIcon className="h-3.5 w-3.5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-100 flex items-center justify-center text-black hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all hover:scale-110"
                    onClick={() => handleShare('threads')}
                    title="Share on Threads"
                >
                    <ThreadsIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-100 flex items-center justify-center text-pink-600 hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all hover:scale-110"
                    onClick={() => handleShare('instagram')}
                    title="Share on Instagram (Copy Link)"
                >
                    <Instagram className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-gray-100 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all hover:scale-110"
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép liên kết');
                    }}
                    title="Copy Link"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ShareButtons;
