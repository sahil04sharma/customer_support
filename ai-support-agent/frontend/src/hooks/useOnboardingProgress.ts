import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  allStepsComplete,
  getOnboardingDismissed,
  getOnboardingTested,
  setOnboardingDismissed,
  setOnboardingTested,
  type OnboardingStatus,
} from '../lib/onboarding';

const defaultStatus: OnboardingStatus = {
  hasReadyDoc: false,
  hasCustomized: false,
  hasConversation: false,
};

export function useOnboardingProgress() {
  const [status, setStatus] = useState<OnboardingStatus>(defaultStatus);
  const [tested, setTested] = useState(getOnboardingTested);
  const [dismissed, setDismissed] = useState(getOnboardingDismissed);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return api.get<OnboardingStatus>('/api/business/onboarding').then((res) => {
      setStatus(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function dismiss() {
    setOnboardingDismissed();
    setDismissed(true);
  }

  const markTested = useCallback(() => {
    setOnboardingTested();
    setTested(true);
  }, []);

  const complete = allStepsComplete(status, tested);
  const showChecklist = !dismissed && !complete;

  return {
    status,
    tested,
    dismissed,
    loading,
    complete,
    showChecklist,
    refresh,
    dismiss,
    markTested,
  };
}
