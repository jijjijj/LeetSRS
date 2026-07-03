import { useState } from 'react';
import {
  Button,
  TextField,
  Input,
  Label,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from 'react-aria-components';
import { FaChevronDown } from 'react-icons/fa6';
import type { Difficulty } from '@/shared/cards';
import { parseProblemUrl, suggestNameFromUrl } from '@/shared/problem-url';
import { useAddCardMutation } from '@/hooks/useBackgroundQueries';
import { useI18n } from '../../../contexts/I18nContext';

const DIFFICULTY_OPTIONS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

type AddCardFormProps = {
  existingSlugs: Set<string>;
  onDone: () => void;
};

export function AddCardForm({ existingSlugs, onDone }: AddCardFormProps) {
  const t = useI18n();
  const addCardMutation = useAddCardMutation();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [error, setError] = useState<string | null>(null);

  const difficultyLabels: Record<Difficulty, string> = {
    Easy: t.difficulty.easy,
    Medium: t.difficulty.medium,
    Hard: t.difficulty.hard,
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    if (!nameTouched) {
      setName(suggestNameFromUrl(value));
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setNameTouched(true);
    setError(null);
  };

  const handleSubmit = async () => {
    const parsed = parseProblemUrl(url);
    if (!parsed) {
      setError(t.cardsView.addCard.invalidUrl);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.cardsView.addCard.nameRequired);
      return;
    }

    if (existingSlugs.has(parsed.slug)) {
      setError(t.cardsView.addCard.alreadyExists);
      return;
    }

    try {
      await addCardMutation.mutateAsync({
        slug: parsed.slug,
        name: trimmedName,
        leetcodeId: '',
        difficulty,
        domain: parsed.domain,
        url: parsed.url,
      });
      onDone();
    } catch (err) {
      console.error('Failed to add card:', err);
      setError(t.errors.unknownError);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-secondary border border-current flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{t.cardsView.addCard.title}</h3>

      <TextField value={url} onChange={handleUrlChange}>
        <Label className="text-xs text-secondary">{t.cardsView.addCard.urlLabel}</Label>
        <Input
          className="w-full mt-1 px-3 py-2 bg-primary rounded-lg border border-current text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder={t.cardsView.addCard.urlPlaceholder}
        />
      </TextField>

      <TextField value={name} onChange={handleNameChange}>
        <Label className="text-xs text-secondary">{t.cardsView.addCard.nameLabel}</Label>
        <Input
          className="w-full mt-1 px-3 py-2 bg-primary rounded-lg border border-current text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder={t.cardsView.addCard.namePlaceholder}
        />
      </TextField>

      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{t.cardsView.addCard.difficultyLabel}</span>
        <Select
          selectedKey={difficulty}
          onSelectionChange={(key) => setDifficulty(key as Difficulty)}
          aria-label={t.cardsView.addCard.difficultyLabel}
        >
          <Button className="flex items-center gap-2 px-3 py-1.5 rounded bg-tertiary text-primary hover:opacity-80 transition-opacity cursor-pointer">
            <SelectValue>{difficultyLabels[difficulty]}</SelectValue>
            <FaChevronDown className="text-xs" />
          </Button>
          <Popover className="bg-secondary text-primary border border-tertiary rounded-lg shadow-lg p-1 min-w-[120px]">
            <ListBox className="outline-none">
              {DIFFICULTY_OPTIONS.map((option) => (
                <ListBoxItem
                  key={option}
                  id={option}
                  className="px-3 py-2 rounded cursor-pointer outline-none text-primary hover:bg-tertiary focus:bg-tertiary data-[selected]:bg-tertiary"
                >
                  {difficultyLabels[option]}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex gap-2 justify-end">
        <Button
          onPress={onDone}
          className="px-3 py-1.5 rounded text-sm bg-tertiary text-primary hover:opacity-80 transition-opacity"
        >
          {t.cardsView.addCard.cancel}
        </Button>
        <Button
          onPress={handleSubmit}
          isDisabled={addCardMutation.isPending}
          className="px-3 py-1.5 rounded text-sm bg-accent text-white hover:opacity-90 disabled:opacity-50"
        >
          {t.cardsView.addCard.submit}
        </Button>
      </div>
    </div>
  );
}
