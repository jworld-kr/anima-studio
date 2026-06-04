'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/app/types';
import { sessionStorage } from './storage';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const s = sessionStorage.getSession();
    setSession(s);
    setIsLoading(false);

    if (!s) {
      router.push('/login');
    }
  }, [router]);

  const logout = () => {
    sessionStorage.clearSession();
    setSession(null);
    router.push('/login');
  };

  return { session, isLoading, logout };
};
