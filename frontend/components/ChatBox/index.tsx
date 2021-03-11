import {
  Form,
  ChatArea,
  MentionsTextarea,
  Toolbox,
  SendButton,
  EachMention,
} from '@components/ChatBox/style';
import React, { useCallback, useEffect, useRef } from 'react';
import autosize from 'autosize';
import { Mention, SuggestionDataItem } from 'react-mentions';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetch';
import gravatar from 'gravatar';

interface IProps {
  chat: string;
  onSubmitForm: (_e: React.FormEvent<HTMLFormElement>) => void;
  onChangeChat: (_e: any) => void;
  placeholder: string;
}

export default function ChatBox({ chat, onSubmitForm, onChangeChat, placeholder }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData } = useUserDataFetch({ dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  );

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

  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean
    ): React.ReactNode => {
      if (!memberData) return;
      return (
        <EachMention focus={focus}>
          <img
            src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData]
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeyDownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((v: IUser) => ({ id: v.id, display: v.nickname })) || []}
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
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
