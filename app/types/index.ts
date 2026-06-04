// Auth
export interface Session {
  email: string;
  sessionId: string;
  loginAt: string;
}

// Channel
export interface Channel {
  id: string;
  name: string;
  thumbnail?: string;
  activeCategories: string[];
  createdAt: string;
  worldBuilding: WorldBuilding;
}

// World Building
export interface WorldBuilding {
  basic: {
    name: string;
    age?: number;
    job: string;
    appearance?: string;
    oneline?: string;
  };
  personality: {
    traits?: string;
    expressions?: string[];
    speechPattern?: string;
    forbiddenWords?: string[];
  };
  world: {
    background?: string;
    interests?: string[];
    values?: string;
    dailyRoutine?: string;
  };
  contentDirection: {
    mainTopics?: string[];
    sellWhat?: string;
    message?: string;
    forbiddenTopics?: string[];
  };
  targetAudience: {
    description?: string;
    ageGroup?: string;
    interests?: string;
    toneTip?: string;
  };
  tone: {
    seriousness: number; // 1-10
    professionalism: number; // 1-10
    formality: number; // 1-10
    depth: number; // 1-10
  };
  examples: Array<{
    title?: string;
    content: string;
  }>;
  forbiddenThings?: string;
}

// Idea Item
export interface IdeaItem {
  id: string;
  channelId: string;
  title: string;
  category: string;
  createdAt: string;
}

// Category groups
export const IDEA_CATEGORY_GROUPS = {
  marketing: {
    label: '📊 마케팅/영업',
    categories: ['마케팅 전략', '영업 기법', '고객 사례', '제품 소개', 'SNS 마케팅', '브랜딩'],
  },
  business: {
    label: '💼 경영/비즈니스',
    categories: ['경영 팁', '자영업 노하우', '사업 아이디어', '시장 분석', '경제 트렌드'],
  },
  industry: {
    label: '🏪 산업별',
    categories: ['음식점 운영', '카페 운영', '뷰티/미용', '부동산', '금융'],
  },
  content: {
    label: '✍️ 콘텐츠/창작',
    categories: ['콘텐츠 제작', '스토리텔링', '콘텐츠 기획', '비주얼 마케팅'],
  },
  lifestyle: {
    label: '🌟 라이프스타일',
    categories: ['라이프스타일', '일상 팁', '시간 관리', '자기계발', '건강/운동'],
  },
  trends: {
    label: '🚀 트렌드/정보',
    categories: ['기술 트렌드', '뉴스/이슈', '교육', '고민 상담'],
  },
  other: {
    label: '🎯 기타',
    categories: ['프로모션', '기타'],
  },
} as const;

export const DEFAULT_IDEA_CATEGORIES = [
  '마케팅 전략', '영업 기법', '고객 사례', '제품 소개', 'SNS 마케팅', '브랜딩',
  '경영 팁', '자영업 노하우', '사업 아이디어', '시장 분석', '경제 트렌드',
  '음식점 운영', '카페 운영', '뷰티/미용', '부동산', '금융',
  '콘텐츠 제작', '스토리텔링', '콘텐츠 기획', '비주얼 마케팅',
  '라이프스타일', '일상 팁', '시간 관리', '자기계발', '건강/운동',
  '기술 트렌드', '뉴스/이슈', '교육', '고민 상담',
  '프로모션', '기타',
] as const;

// Thread Content
export interface ThreadContent {
  id: string;
  channelId: string;
  type: 'thread';
  status: 'draft' | 'published';
  ideaId?: string;
  category?: string;
  input: {
    topic: string;
    referenceUrl?: string;
    hookStyle: string;
    length: number;
  };
  output: {
    hook: string;
    posts: Array<{
      order: number;
      content: string;
    }>;
  };
  publishedAt?: string;
  publishedUrl?: string;
  createdAt: string;
}
