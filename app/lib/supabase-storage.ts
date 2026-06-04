import { supabase } from './supabase';
import { Session, Channel, ThreadContent, IdeaItem, WorldBuilding } from '@/app/types';

const DEFAULT_WORLD_BUILDING: WorldBuilding = {
  basic: {
    name: '',
    age: undefined,
    job: '',
    appearance: '',
    oneline: '',
  },
  personality: {
    traits: '',
    expressions: [],
    speechPattern: '',
    forbiddenWords: [],
  },
  world: {
    background: '',
    interests: [],
    values: '',
    dailyRoutine: '',
  },
  contentDirection: {
    mainTopics: [],
    sellWhat: '',
    message: '',
    forbiddenTopics: [],
  },
  targetAudience: {
    description: '',
    ageGroup: '',
    interests: '',
    toneTip: '',
  },
  tone: {
    seriousness: 5,
    professionalism: 5,
    formality: 5,
    depth: 5,
  },
  examples: [],
  forbiddenThings: '',
};

const normalizeWorldBuilding = (raw: any): WorldBuilding => {
  const wb = raw || {};
  return {
    basic: {
      name: wb.basic?.name || '',
      age: wb.basic?.age,
      job: wb.basic?.job || '',
      appearance: wb.basic?.appearance || '',
      oneline: wb.basic?.oneline || '',
    },
    personality: {
      traits: wb.personality?.traits || '',
      expressions: Array.isArray(wb.personality?.expressions)
        ? wb.personality.expressions
        : [],
      speechPattern: wb.personality?.speechPattern || '',
      forbiddenWords: Array.isArray(wb.personality?.forbiddenWords)
        ? wb.personality.forbiddenWords
        : [],
    },
    world: {
      background: wb.world?.background || '',
      interests: Array.isArray(wb.world?.interests) ? wb.world.interests : [],
      values: wb.world?.values || '',
      dailyRoutine: wb.world?.dailyRoutine || '',
    },
    contentDirection: {
      mainTopics: Array.isArray(wb.contentDirection?.mainTopics)
        ? wb.contentDirection.mainTopics
        : [],
      sellWhat: wb.contentDirection?.sellWhat || '',
      message: wb.contentDirection?.message || '',
      forbiddenTopics: Array.isArray(wb.contentDirection?.forbiddenTopics)
        ? wb.contentDirection.forbiddenTopics
        : [],
    },
    targetAudience: {
      description: wb.targetAudience?.description || '',
      ageGroup: wb.targetAudience?.ageGroup || '',
      interests: wb.targetAudience?.interests || '',
      toneTip: wb.targetAudience?.toneTip || '',
    },
    tone: {
      seriousness:
        typeof wb.tone?.seriousness === 'number' ? wb.tone.seriousness : 5,
      professionalism:
        typeof wb.tone?.professionalism === 'number'
          ? wb.tone.professionalism
          : 5,
      formality:
        typeof wb.tone?.formality === 'number' ? wb.tone.formality : 5,
      depth: typeof wb.tone?.depth === 'number' ? wb.tone.depth : 5,
    },
    examples: Array.isArray(wb.examples)
      ? wb.examples.map((ex: any) => ({
          title: ex?.title || '',
          content: ex?.content || '',
        }))
      : [],
    forbiddenThings: wb.forbiddenThings || '',
  };
};

// Session
export const sessionStorage = {
  getSession: async (): Promise<Session | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return null;
      return {
        email: session.user.email,
        sessionId: session.user.id,
        loginAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },
  setSession: async (session: Session) => {
    // Supabase auth handles this automatically
  },
  clearSession: async () => {
    await supabase.auth.signOut();
  },
};

// Channels
export const channelStorage = {
  getChannels: async (userEmail: string): Promise<Channel[]> => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('user_email', userEmail);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        thumbnail: row.thumbnail,
        activeCategories: row.active_categories || [],
        createdAt: row.created_at,
        worldBuilding: normalizeWorldBuilding(row.world_building),
      }));
    } catch (error) {
      console.error('Failed to get channels:', error);
      return [];
    }
  },

  getChannel: async (id: string): Promise<Channel | null> => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        name: data.name,
        thumbnail: data.thumbnail,
        activeCategories: data.active_categories || [],
        createdAt: data.created_at,
        worldBuilding: normalizeWorldBuilding(data.world_building),
      } : null;
    } catch (error) {
      console.error('Failed to get channel:', error);
      return null;
    }
  },

  addChannel: async (userEmail: string, channel: Channel) => {
    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          id: channel.id,
          user_email: userEmail,
          name: channel.name,
          thumbnail: channel.thumbnail,
          active_categories: channel.activeCategories,
          world_building: channel.worldBuilding,
          created_at: channel.createdAt,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to add channel');
      }
    } catch (error) {
      console.error('Failed to add channel:', error);
      throw error;
    }
  },

  updateChannel: async (id: string, updates: Partial<Channel>) => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({
          name: updates.name,
          thumbnail: updates.thumbnail,
          active_categories: updates.activeCategories,
          world_building: updates.worldBuilding,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  },

  deleteChannel: async (id: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  },
};

// Ideas
export const ideaStorage = {
  getIdeas: async (channelId: string): Promise<IdeaItem[]> => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('channel_id', channelId);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        channelId: row.channel_id,
        title: row.title,
        category: row.category,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Failed to get ideas:', error);
      return [];
    }
  },

  getIdea: async (id: string): Promise<IdeaItem | null> => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        channelId: data.channel_id,
        title: data.title,
        category: data.category,
        createdAt: data.created_at,
      } : null;
    } catch (error) {
      console.error('Failed to get idea:', error);
      return null;
    }
  },

  addIdea: async (idea: IdeaItem) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({
          id: idea.id,
          channel_id: idea.channelId,
          title: idea.title,
          category: idea.category,
          created_at: idea.createdAt,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add idea:', error);
    }
  },

  deleteIdea: async (id: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  },
};

// Contents (Thread)
export const contentStorage = {
  getContents: async (channelId: string): Promise<ThreadContent[]> => {
    try {
      const { data, error } = await supabase
        .from('thread_contents')
        .select('*')
        .eq('channel_id', channelId);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        channelId: row.channel_id,
        type: 'thread',
        status: row.status,
        ideaId: row.idea_id,
        category: row.category,
        input: row.input,
        output: row.output,
        publishedAt: row.published_at,
        publishedUrl: row.published_url,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Failed to get contents:', error);
      return [];
    }
  },

  getContentsByStatus: async (
    channelId: string,
    status: ThreadContent['status'],
    /** When set, only return items created within the last N days.
     *  Used for plan-based history retention (Free = 30 days). */
    retentionDays?: number
  ): Promise<ThreadContent[]> => {
    try {
      let query = supabase
        .from('thread_contents')
        .select('*')
        .eq('channel_id', channelId)
        .eq('status', status);

      if (typeof retentionDays === 'number' && retentionDays > 0) {
        const cutoff = new Date(
          Date.now() - retentionDays * 24 * 60 * 60 * 1000
        ).toISOString();
        query = query.gte('created_at', cutoff);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        channelId: row.channel_id,
        type: 'thread',
        status: row.status,
        ideaId: row.idea_id,
        category: row.category,
        input: row.input,
        output: row.output,
        publishedAt: row.published_at,
        publishedUrl: row.published_url,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Failed to get contents by status:', error);
      return [];
    }
  },

  getContent: async (id: string): Promise<ThreadContent | null> => {
    try {
      const { data, error } = await supabase
        .from('thread_contents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        channelId: data.channel_id,
        type: 'thread',
        status: data.status,
        ideaId: data.idea_id,
        category: data.category,
        input: data.input,
        output: data.output,
        publishedAt: data.published_at,
        publishedUrl: data.published_url,
        createdAt: data.created_at,
      } : null;
    } catch (error) {
      console.error('Failed to get content:', error);
      return null;
    }
  },

  addContent: async (content: ThreadContent) => {
    try {
      const { error } = await supabase
        .from('thread_contents')
        .insert({
          id: content.id,
          channel_id: content.channelId,
          type: content.type,
          status: content.status,
          idea_id: content.ideaId,
          category: content.category,
          input: content.input,
          output: content.output,
          published_at: content.publishedAt,
          published_url: content.publishedUrl,
          created_at: content.createdAt,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add content:', error);
    }
  },

  updateContent: async (id: string, updates: Partial<ThreadContent>) => {
    try {
      const { error } = await supabase
        .from('thread_contents')
        .update({
          status: updates.status,
          published_at: updates.publishedAt,
          published_url: updates.publishedUrl,
          input: updates.input,
          output: updates.output,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  },

  deleteContent: async (id: string) => {
    try {
      const { error } = await supabase
        .from('thread_contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  },
};

// Utility
export const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
