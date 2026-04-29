import React from "react";
import {useTranslations} from 'next-intl';
import Button from "../../../../../components/atoms/Button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  characterLimit: number;
  messageLimit: number;
  userMessageCount: number;
  isMessageLimitReached: boolean;
};

const ChatInput = ({
  value,
  onChange,
  onSend,
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

  return (
    <div className="border-t border-base-300 p-4">
      <div className="flex flex-row gap-2 items-end w-full">
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= characterLimit) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('type_message')}
          className="textarea border-2 border-neutral focus:border-primary bg-base-300 flex-1 resize-none focus:outline-none"
          rows={2}
          disabled={disabled || isMessageLimitReached}
        />
        <Button
          clickAction={onSend}
          disabled={sendDisabled}
          primary={true}
          fitContent={true}
        >
          {t('send')}
        </Button>
      </div>

      <div className="mt-2 text-center space-y-1">
        <div className="grid grid-cols-4">
          <p className={`text-left text-sm ${value.length > characterLimit - 50 ? 'text-warning' : 'text-base-content/60'}`}>
            {value.length}/{characterLimit}
          </p>
          {isMessageLimitReached ? (
            <p className="col-span-2 text-sm text-error">{t('message_limit_reached')}</p>
          ) : (
            <p
              className={`col-span-2 text-sm ${userMessageCount >= messageLimit - 2 ? 'text-warning' : 'text-base-content/60'}`}>
              {t('messages_remaining', {remaining: messageLimit - userMessageCount})}
            </p>
          )}
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
