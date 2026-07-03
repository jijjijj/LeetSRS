import {
  createNeetcodeSrsButton,
  extractNeetcodeProblemData,
  isNeetcodeDarkMode,
  isNeetcodeProblemPage,
  RatingMenu,
} from '@/utils/content';
import { sendMessage, MessageType } from '@/shared/messages';
import type { Grade } from 'ts-fsrs';

export default defineContentScript({
  matches: ['*://*.neetcode.io/*'],
  runAt: 'document_idle',
  async main() {
    // Wake up service worker so it's ready when user interacts
    try {
      await sendMessage({ type: MessageType.PING });
    } catch (error) {
      console.error('Failed to ping service worker:', error);
    }
    setupNeetcodeSrsButton();
  },
});

async function withNeetcodeProblemData<T>(
  action: (problemData: NonNullable<ReturnType<typeof extractNeetcodeProblemData>>) => Promise<T>
): Promise<T | undefined> {
  // Extract at click time: the SPA can navigate to another problem while the button persists
  const problemData = extractNeetcodeProblemData();
  if (!problemData) {
    console.error('Could not extract NeetCode problem data');
    return undefined;
  }

  try {
    return await action(problemData);
  } catch (error) {
    console.error('Error processing action:', error);
    return undefined;
  }
}

function setupNeetcodeSrsButton() {
  const BUTTON_ID = 'leetsrs-neetcode-button-wrapper';

  function insertButton() {
    let ratingMenu: RatingMenu | null = null;

    const buttonWrapper = createNeetcodeSrsButton(() => {
      if (ratingMenu) {
        ratingMenu.toggle();
      }
    }, isNeetcodeDarkMode);
    buttonWrapper.id = BUTTON_ID;

    // Anchor next to the problem title; fall back to a floating button so the
    // feature keeps working if NeetCode's DOM changes
    const heading = document.querySelector('h1');
    let anchoredInHeader = false;
    if (heading?.parentElement) {
      buttonWrapper.style.marginLeft = '8px';
      heading.insertAdjacentElement('afterend', buttonWrapper);
      anchoredInHeader = true;
    } else {
      buttonWrapper.style.cssText += 'position: fixed; bottom: 24px; right: 24px; z-index: 2147483000;';
      document.body.appendChild(buttonWrapper);
    }

    ratingMenu = new RatingMenu(
      buttonWrapper,
      async (rating, label) => {
        await withNeetcodeProblemData(async (problemData) => {
          const result = await sendMessage({
            type: MessageType.RATE_CARD,
            slug: problemData.storageSlug,
            name: problemData.title,
            rating: rating as Grade,
            leetcodeId: '',
            difficulty: problemData.difficulty,
            domain: 'neetcode.io',
            url: problemData.url,
          });
          console.log(`${label} - Card rated:`, result);
          return result;
        });
      },
      async () => {
        await withNeetcodeProblemData(async (problemData) => {
          const result = await sendMessage({
            type: MessageType.ADD_CARD,
            slug: problemData.storageSlug,
            name: problemData.title,
            leetcodeId: '',
            difficulty: problemData.difficulty,
            domain: 'neetcode.io',
            url: problemData.url,
          });
          console.log('Add without rating - Card added:', result);
          return result;
        });
      },
      { position: anchoredInHeader ? 'bottom' : 'top', isDark: isNeetcodeDarkMode }
    );
  }

  const tryInsertOrRemoveButton = () => {
    const existing = document.getElementById(BUTTON_ID);

    // The SPA keeps running on non-problem pages; remove the button there
    if (!isNeetcodeProblemPage()) {
      existing?.remove();
      return;
    }

    if (!existing) {
      insertButton();
    }
  };
  tryInsertOrRemoveButton();

  // Use MutationObserver to handle SPA navigation and re-renders.
  const observer = new MutationObserver(tryInsertOrRemoveButton);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
