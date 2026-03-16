'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo, ReactNode } from "react";
import { pb } from "@/lib/pb";
import { getStaticArticles } from "@/data/staticArticles";
import { publishScheduledArticles } from "@/lib/articles";

export type PublishedArticle = {
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
  featured?: boolean;
  editorsPick?: boolean;
  longform?: boolean;
  views?: number;
  tags?: unknown;
  category?: string;
  author?: string;
  expand?: {
    category?: { id?: string; slug?: string; name_vi?: string; name_jp?: string; name?: string };
    author?: { id?: string; name?: string; email?: string };
  };
};

type PublishedArticlesContextType = {
  items: PublishedArticle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const PublishedArticlesContext = createContext<PublishedArticlesContextType | undefined>(undefined);

function getErrorMessage(err: unknown) {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return null;
}

export const PublishedArticlesProvider = ({
  children,
  initialItems,
}: {
  children: ReactNode;
  initialItems?: PublishedArticle[];
}) => {
  const [pbItems, setPbItems] = useState<PublishedArticle[]>(initialItems ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reqIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      // Fetch published articles sorted by newest first
      const res = await pb.collection("articles").getList<PublishedArticle>(1, 50, {
        filter: 'status="published"',
        sort: "-publishedAt,-created",
        expand: "author,category",
      });
      if (reqId !== reqIdRef.current) return; // ignore stale responses
      setPbItems(res.items || []);
    } catch (err: unknown) {
      if (reqId !== reqIdRef.current) return;
      setPbItems([]);
      setError(getErrorMessage(err) || "Failed to load articles");
    } finally {
      if (reqId !== reqIdRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-publish scheduled articles then fetch
    const init = async () => {
      try {
        await publishScheduledArticles();
      } catch {
        // Ignore errors from auto-publish
      }
      refetch();
    };
    init();

    // Poll every 60 seconds: auto-publish scheduled articles and refetch
    // so new articles appear without page reload when their scheduled time arrives
    const intervalId = setInterval(async () => {
      try {
        const publishedIds = await publishScheduledArticles();
        // Only refetch if new articles were actually published, or periodically refresh
        if (publishedIds.length > 0) {
          refetch();
        }
      } catch {
        // Ignore polling errors silently
      }
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [refetch]);

  // Merge PB articles (priority) with static mock articles (supplement).
  // Static articles always appear after PB articles so real data takes precedence.
  const items = useMemo(() => {
    const staticItems = getStaticArticles();
    return [...pbItems, ...staticItems];
  }, [pbItems]);

  return (
    <PublishedArticlesContext.Provider value={{ items, loading, error, refetch }}>
      {children}
    </PublishedArticlesContext.Provider>
  );
};

export const usePublishedArticles = () => {
  const ctx = useContext(PublishedArticlesContext);
  if (!ctx) throw new Error("usePublishedArticles must be used within a PublishedArticlesProvider");
  return ctx;
};

