"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/app/lib/supabase";

interface InkBalance {
  subscription: number;
  topup: number;
  total: number;
}

interface InkContextValue {
  balance: InkBalance | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setBalance: (b: InkBalance) => void;
  /** Show the topup modal. Optional `required` shows what was needed. */
  promptTopup: (required?: number) => void;
  /** Internal — read by the layout that owns the modal. */
  _topupRequired: number | null;
  _dismissTopup: () => void;
}

const InkCtx = createContext<InkContextValue | null>(null);

export function useInk() {
  const ctx = useContext(InkCtx);
  if (!ctx) throw new Error("useInk must be used inside <InkProvider>");
  return ctx;
}

export function InkProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState<InkBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [topupRequired, setTopupRequired] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setBalanceState(null);
        setLoading(false);
        return;
      }
      // Initialize starter ink for new users (idempotent)
      await fetch("/api/ink/init", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {});

      const res = await fetch("/api/ink/balance", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalanceState(data.balance);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setBalance = useCallback((b: InkBalance) => {
    setBalanceState(b);
  }, []);

  const promptTopup = useCallback((required?: number) => {
    setTopupRequired(required ?? 0);
  }, []);

  const _dismissTopup = useCallback(() => setTopupRequired(null), []);

  return (
    <InkCtx.Provider
      value={{
        balance,
        loading,
        refresh,
        setBalance,
        promptTopup,
        _topupRequired: topupRequired,
        _dismissTopup,
      }}
    >
      {children}
    </InkCtx.Provider>
  );
}
