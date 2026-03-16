'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-50 transition-all duration-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
            <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white transition-all hover:scale-110 active:scale-95"
                onClick={scrollToTop}
                title="Về đầu trang"
            >
                <ChevronUp className="h-6 w-6 stroke-[3px]" />
            </Button>
        </div>
    );
};

export default BackToTopButton;

