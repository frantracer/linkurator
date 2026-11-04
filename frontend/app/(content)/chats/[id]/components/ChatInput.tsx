import React from "react";
import {useTranslations} from 'next-intl';
import {PaperAirplaneIcon} from "../../../../../components/atoms/Icons";
import Button from "../../../../../components/atoms/Button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onNewConversation: () => void;
  disabled: boolean;
  characterLimit: number;
  messageLimit: number;
  userMessageCount: number;
  isMessageLimitReached: boolean;
};

const CHARACTERS_WARNING_THRESHOLD = 100;
const MESSAGES_WARNING_THRESHOLD = 2;
const MAX_ROWS = 6;

const ChatInput = ({
  value,
  onChange,
  onSend,
  onNewConversation,
  disabled,
  characterLimit,
  messageLimit,
  userMessageCount,
  isMessageLimitReached,
}: ChatInputProps) => {
  const t = useTranslations('common');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const sendDisabled = !value.trim() || disabled || isMessageLimitReached || value.length > characterLimit;
  const charactersLeft = characterLimit - value.length;
  const messagesLeft = messageLimit - userMessageCount;
  const rows = Math.min(MAX_ROWS, Math.max(1, value.split("\n").length));

  if (isMessageLimitReached) {
    return (
      <div className="p-4 pb-mobile-nav">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-neutral bg-base-100 px-4 py-3">
          <p className="text-sm text-base-content/80">{t('message_limit_reached')}</p>
          <Button clickAction={onNewConversation}>{t('new_chat')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-2 pb-mobile-nav">
      <div className="max-w-3xl mx-auto flex flex-row items-end gap-2 rounded-2xl border border-neutral bg-base-100 shadow-sm px-3 py-2 focus-within:border-primary">
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= characterLimit) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          aria-label={t('message_input_label')}
          placeholder={t('type_message')}
          className="flex-1 resize-none bg-transparent outline-none py-1.5 text-sm leading-6"
          rows={rows}
          disabled={disabled}
        />
        {!sendDisabled &&
            <button
                type="button"
                onClick={onSend}
                aria-label={t('send')}
                title={t('send')}
                className="btn btn-primary btn-sm btn-circle"
            >
                <PaperAirplaneIcon/>
            </button>
        }
      </div>
      {(charactersLeft <= CHARACTERS_WARNING_THRESHOLD || messagesLeft <= MESSAGES_WARNING_THRESHOLD) &&
          <div className="max-w-3xl mx-auto flex flex-row justify-between gap-2 px-3 pt-1.5 text-xs text-warning" aria-live="polite">
              <span>{charactersLeft <= CHARACTERS_WARNING_THRESHOLD && t('characters_left', {count: charactersLeft})}</span>
              <span>{messagesLeft <= MESSAGES_WARNING_THRESHOLD && t('messages_remaining', {remaining: messagesLeft})}</span>
          </div>
      }
    </div>
  );
};

export default ChatInput;
