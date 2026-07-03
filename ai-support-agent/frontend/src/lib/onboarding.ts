export interface OnboardingStatus {
  hasReadyDoc: boolean;
  hasCustomized: boolean;
  hasConversation: boolean;
}

export const ONBOARDING_DISMISSED_KEY = 'supportdesk-onboarding-dismissed';
export const ONBOARDING_TESTED_KEY = 'supportdesk-onboarding-tested';

export function getOnboardingTested(): boolean {
  return localStorage.getItem(ONBOARDING_TESTED_KEY) === 'true';
}

export function setOnboardingTested(): void {
  localStorage.setItem(ONBOARDING_TESTED_KEY, 'true');
}

export function getOnboardingDismissed(): boolean {
  return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
}

export function setOnboardingDismissed(): void {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  to: string;
  cta: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'knowledge',
    title: 'Add knowledge',
    description: 'Upload FAQs and policies so the AI can answer from your content.',
    to: '/dashboard/documents',
    cta: 'Upload documents',
  },
  {
    id: 'customize',
    title: 'Customize widget',
    description: 'Set your brand color, welcome message, and assistant name.',
    to: '/dashboard/settings',
    cta: 'Open widget settings',
  },
  {
    id: 'install',
    title: 'Install on your site',
    description: 'Copy the embed code and add it to your website.',
    to: '/dashboard/embed',
    cta: 'Get embed code',
  },
  {
    id: 'test',
    title: 'Test your assistant',
    description: 'Try a live chat preview before customers see it.',
    to: '/dashboard/test',
    cta: 'Open test preview',
  },
];

export function isStepComplete(
  stepId: string,
  status: OnboardingStatus,
  tested: boolean
): boolean {
  switch (stepId) {
    case 'knowledge':
      return status.hasReadyDoc;
    case 'customize':
      return status.hasCustomized;
    case 'install':
      return status.hasConversation;
    case 'test':
      return tested;
    default:
      return false;
  }
}

export function countCompletedSteps(
  status: OnboardingStatus,
  tested: boolean
): number {
  return ONBOARDING_STEPS.filter((s) => isStepComplete(s.id, status, tested)).length;
}

export function allStepsComplete(status: OnboardingStatus, tested: boolean): boolean {
  return countCompletedSteps(status, tested) === ONBOARDING_STEPS.length;
}
