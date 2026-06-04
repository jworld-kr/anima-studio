"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { channelStorage } from "@/app/lib/supabase-storage";
import { Channel } from "@/app/types";
import { AppLayout } from "@/app/components/app/AppLayout";
import { ThreadWorkspace } from "@/app/components/app/dashboard/ThreadWorkspace";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.channelId as string;

  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          router.push("/login");
          return;
        }
        setUser(session.user);

        const loaded = await channelStorage.getChannels(session.user.email);
        setChannels(loaded);

        const channel = await channelStorage.getChannel(channelId);
        if (channel) {
          setCurrentChannel(channel);
        } else {
          router.push("/channels");
        }
      } catch (e) {
        console.error(e);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [channelId, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-paper flex">
        <div className="hidden lg:block w-[260px] border-r border-ink-200 p-5">
          <Skeleton className="h-6 w-24 mb-6" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-10">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-5 w-40 mb-10" />
          <Skeleton className="h-12 w-full max-w-[760px] mb-3" />
          <Skeleton className="h-40 w-full max-w-[760px]" />
        </div>
      </div>
    );
  }

  if (!currentChannel) return null;

  return (
    <AppLayout
      channels={channels}
      currentChannelId={channelId}
      userEmail={user.email}
    >
      <ThreadWorkspace channel={currentChannel} />
    </AppLayout>
  );
}
