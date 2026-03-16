'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CategoryRecord } from "@/lib/categories";
import { listCategories } from "@/lib/categories";

type CategoriesContextType = {
  categories: CategoryRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

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

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [raw, setRaw] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCategories(50);
      setRaw(res.items || []);
    } catch (err: unknown) {
      setRaw([]);
      setError(getErrorMessage(err) || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only load categories from PocketBase - keep original order (by created time)
  const categories = useMemo(() => {
    return raw;
  }, [raw]);

  return (
    <CategoriesContext.Provider value={{ categories, loading, error, refetch }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within a CategoriesProvider");
  return ctx;
};

