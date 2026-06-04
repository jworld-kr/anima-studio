import { Session, Channel, ThreadContent, IdeaItem } from '@/app/types';

const STORAGE_KEYS = {
  SESSION: 'marketing-tool:session',
  CHANNELS: 'marketing-tool:channels',
  IDEAS: 'marketing-tool:ideas',
  CONTENTS: 'marketing-tool:contents',
};

// Session
export const sessionStorage = {
  getSession: (): Session | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  setSession: (session: Session) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },
  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

// Channels
export const channelStorage = {
  getChannels: (): Channel[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return data ? JSON.parse(data) : [];
  },
  getChannel: (id: string): Channel | null => {
    const channels = channelStorage.getChannels();
    return channels.find((ch) => ch.id === id) || null;
  },
  addChannel: (channel: Channel) => {
    if (typeof window === 'undefined') return;
    const channels = channelStorage.getChannels();
    channels.push(channel);
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  },
  updateChannel: (id: string, updates: Partial<Channel>) => {
    if (typeof window === 'undefined') return;
    const channels = channelStorage.getChannels();
    const index = channels.findIndex((ch) => ch.id === id);
    if (index !== -1) {
      channels[index] = { ...channels[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    }
  },
  deleteChannel: (id: string) => {
    if (typeof window === 'undefined') return;
    const channels = channelStorage.getChannels().filter((ch) => ch.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    // Also delete associated contents
    contentStorage.deleteByChannelId(id);
  },
};

// Ideas
export const ideaStorage = {
  getIdeas: (): IdeaItem[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return data ? JSON.parse(data) : [];
  },
  getIdeasByChannelId: (channelId: string): IdeaItem[] => {
    const ideas = ideaStorage.getIdeas();
    return ideas.filter((i) => i.channelId === channelId);
  },
  getIdea: (id: string): IdeaItem | null => {
    const ideas = ideaStorage.getIdeas();
    return ideas.find((i) => i.id === id) || null;
  },
  addIdea: (idea: IdeaItem) => {
    if (typeof window === 'undefined') return;
    const ideas = ideaStorage.getIdeas();
    ideas.push(idea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  },
  deleteIdea: (id: string) => {
    if (typeof window === 'undefined') return;
    const ideas = ideaStorage.getIdeas().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  },
  deleteByChannelId: (channelId: string) => {
    if (typeof window === 'undefined') return;
    const ideas = ideaStorage.getIdeas().filter((i) => i.channelId !== channelId);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  },
};

// Contents (Thread)
export const contentStorage = {
  getContents: (): ThreadContent[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CONTENTS);
    return data ? JSON.parse(data) : [];
  },
  getContentsByChannelId: (channelId: string): ThreadContent[] => {
    const contents = contentStorage.getContents();
    return contents.filter((c) => c.channelId === channelId);
  },
  getContentsByStatus: (channelId: string, status: ThreadContent['status']): ThreadContent[] => {
    const contents = contentStorage.getContents();
    return contents.filter((c) => c.channelId === channelId && c.status === status);
  },
  getContent: (id: string): ThreadContent | null => {
    const contents = contentStorage.getContents();
    return contents.find((c) => c.id === id) || null;
  },
  addContent: (content: ThreadContent) => {
    if (typeof window === 'undefined') return;
    const contents = contentStorage.getContents();
    contents.push(content);
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
  },
  updateContent: (id: string, updates: Partial<ThreadContent>) => {
    if (typeof window === 'undefined') return;
    const contents = contentStorage.getContents();
    const index = contents.findIndex((c) => c.id === id);
    if (index !== -1) {
      contents[index] = { ...contents[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
    }
  },
  deleteContent: (id: string) => {
    if (typeof window === 'undefined') return;
    const contents = contentStorage.getContents().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
  },
  deleteByChannelId: (channelId: string) => {
    if (typeof window === 'undefined') return;
    const contents = contentStorage.getContents().filter((c) => c.channelId !== channelId);
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
  },
};

// Utility
export const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
