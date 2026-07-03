export type ReadinessLevel = 'EMPTY' | 'LOW' | 'GOOD' | 'STRONG';

export interface DocumentsSummary {
  totalDocuments: number;
  readyDocuments: number;
  statusCounts: {
    READY: number;
    PROCESSING: number;
    FAILED: number;
  };
  totalChunks: number;
  readinessLevel: ReadinessLevel;
}

export interface DocumentRow {
  id: string;
  name: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
  chunkCount: number;
}

export function isLowReadiness(level: ReadinessLevel): boolean {
  return level === 'EMPTY' || level === 'LOW';
}

export const READINESS_STEPS: ReadinessLevel[] = ['EMPTY', 'LOW', 'GOOD', 'STRONG'];

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  EMPTY: 'Empty',
  LOW: 'Low',
  GOOD: 'Good',
  STRONG: 'Strong',
};

export const READINESS_DESCRIPTIONS: Record<ReadinessLevel, string> = {
  EMPTY: 'Upload your first support document to get started.',
  LOW: 'You have some content, but adding more will improve answer quality.',
  GOOD: 'Solid foundation — a few more topics could round this out.',
  STRONG: 'Great coverage — your AI has plenty of material to work with.',
};

export interface RecommendedDoc {
  id: string;
  title: string;
  why: string;
  keywords: string[];
}

export const RECOMMENDED_DOCS: RecommendedDoc[] = [
  {
    id: 'faq',
    title: 'FAQs',
    why: 'Common questions customers ask before buying or using your product.',
    keywords: ['faq', 'frequently', 'questions', 'q&a', 'q and a'],
  },
  {
    id: 'refund',
    title: 'Return & refund policy',
    why: 'Clear rules reduce support tickets about cancellations and refunds.',
    keywords: ['refund', 'return', 'exchange', 'cancel', 'money back'],
  },
  {
    id: 'shipping',
    title: 'Shipping info',
    why: 'Delivery times, tracking, and regions you ship to.',
    keywords: ['ship', 'shipping', 'delivery', 'track', 'dispatch'],
  },
  {
    id: 'pricing',
    title: 'Pricing & plans',
    why: 'Plans, tiers, and what each includes.',
    keywords: ['pric', 'plan', 'subscription', 'billing', 'tier', 'cost'],
  },
  {
    id: 'product',
    title: 'Product & feature guides',
    why: 'How your product works and how to use key features.',
    keywords: ['product', 'feature', 'guide', 'manual', 'how to', 'tutorial'],
  },
  {
    id: 'contact',
    title: 'Contact & hours',
    why: 'When and how customers can reach a human.',
    keywords: ['contact', 'hours', 'support', 'phone', 'email', 'help desk'],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    why: 'Fixes for common errors and issues.',
    keywords: ['trouble', 'fix', 'error', 'issue', 'debug', 'problem', 'not working'],
  },
];

export function detectRecommendedCoverage(documentNames: string[]): Record<string, boolean> {
  const normalized = documentNames.map((n) => n.toLowerCase());
  const coverage: Record<string, boolean> = {};

  for (const doc of RECOMMENDED_DOCS) {
    coverage[doc.id] = normalized.some((name) =>
      doc.keywords.some((kw) => name.includes(kw))
    );
  }

  return coverage;
}
