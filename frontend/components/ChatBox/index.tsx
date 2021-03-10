import { Form, ChatArea, MentionsTextarea, Toolbox, SendButton } from '@components/ChatBox/style';
import React, { useCallback, useEffect, useRef } from 'react';
import autosize from 'autosize';

interface IProps {
  chat: string;
  onSubmitForm: (_e: React.FormEvent<HTMLFormElement>) => void;
  onChangeChat: (_e: any) => void;
  placeholder: string;
}

export default function ChatBox({ chat, onSubmitForm, onChangeChat, placeholder }: IProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeyDownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm]
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeyDownChat}
          placeholder={placeholder}
          ref={textareaRef}
        />
        <Toolbox>
          <SendButton
            className={`c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send${
              chat?.trim() ? '' : ' c-texty_input__button--disabled'
            }`}
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
}
