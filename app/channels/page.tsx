"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { channelStorage } from "@/app/lib/supabase-storage";
import { Channel } from "@/app/types";
import { AppLayout } from "@/app/components/app/AppLayout";
import { PersonaCard } from "@/app/components/app/PersonaCard";
import { EditPersonaModal } from "@/app/components/app/EditPersonaModal";
import { Button } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function ChannelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
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
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

  const handleDelete = async (id: string) => {
    await channelStorage.deleteChannel(id);
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveEdit = async (name: string, thumbnail?: string) => {
    if (!editingChannel) return;
    const updated = { ...editingChannel, name, thumbnail };
    await channelStorage.updateChannel(editingChannel.id, updated);
    setChannels((prev) =>
      prev.map((c) => (c.id === editingChannel.id ? updated : c))
    );
    setEditingChannel(null);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-paper flex">
        <div className="hidden lg:block w-[260px] border-r border-ink-200 p-5">
          <Skeleton className="h-6 w-24 mb-6" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-10">
          <Skeleton className="h-10 w-48 mb-3" />
          <Skeleton className="h-5 w-72 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout channels={channels} userEmail={user.email}>
      <div className="px-6 lg:px-10 py-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-eyebrow text-anima-600 mb-2">Personas</p>
            <h1
              className="font-display text-ink-800"
              style={{
                fontSize: "clamp(28px, 3.5vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                fontWeight: 400,
              }}
            >
              내 페르소나
            </h1>
            <p className="text-[14px] text-ink-500 mt-2 leading-[1.6] max-w-[520px]">
              브랜드의 영혼을 담은 페르소나를 만들고, 그 페르소나로 콘텐츠를
              생성하세요.
            </p>
          </div>
          <Link href="/channels/new">
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={14} strokeWidth={1.75} />}
            >
              새 페르소나
            </Button>
          </Link>
        </header>

        {/* Grid */}
        {channels.length === 0 ? (
          <div className="border border-dashed border-ink-200 rounded-[14px]">
            <EmptyState
              icon={<Sparkles size={20} strokeWidth={1.5} />}
              title={
                <>
                  우리 브랜드의 목소리가 될
                  <br />
                  <span className="text-ink-900 font-medium">
                    첫 번째 페르소나
                  </span>
                  를 빚어보세요.
                </>
              }
              description={
                <>
                  거창하지 않아도 괜찮아요.{" "}
                  <span className="text-ink-700 font-medium">
                    이름과 가벼운 한 줄 소개
                  </span>
                  만 던져주시면, Anima가 8개의 정밀 질문을 통해 시장에서 살아 숨
                  쉴 입체적인 정체성을 완성해 드립니다.
                </>
              }
              action={
                <Link href="/channels/new">
                  <Button
                    variant="primary"
                    leadingIcon={<Plus size={14} strokeWidth={1.75} />}
                  >
                    페르소나 만들기
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <PersonaCard
                key={channel.id}
                channel={channel}
                onEdit={setEditingChannel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editingChannel && (
        <EditPersonaModal
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onSave={handleSaveEdit}
        />
      )}
    </AppLayout>
  );
}
