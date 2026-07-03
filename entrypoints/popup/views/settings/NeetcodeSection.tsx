import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { useI18n } from '../../contexts/I18nContext';

const NEETCODE_ORIGIN = '*://*.neetcode.io/*';

export function NeetcodeSection() {
  const t = useI18n();
  const [granted, setGranted] = useState<boolean | null>(null);

  const checkPermission = useCallback(async () => {
    const result = await browser.permissions.contains({ origins: [NEETCODE_ORIGIN] });
    setGranted(result);
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const enable = async () => {
    await browser.permissions.request({ origins: [NEETCODE_ORIGIN] });
    await checkPermission();
  };

  // Hide while loading or if already enabled
  if (granted === null || granted) return null;

  return (
    <div className="mb-6 p-4 rounded-lg bg-secondary text-primary">
      <h3 className="text-lg font-semibold mb-2">{t.settings.neetcode.title}</h3>
      <p className="text-sm text-tertiary mb-4">{t.settings.neetcode.description}</p>
      <button
        onClick={enable}
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
      >
        {t.settings.neetcode.enable}
      </button>
    </div>
  );
}
