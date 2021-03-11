import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { useCallback, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { ChatZone, Section } from './style';

interface IProps {
  chatData: IDM[];
}

/**
 * 채팅 화면
 * @param chatData 채팅 데이터
 */
export default function ChatList({ chatData }: IProps) {
  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {}, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData.map((chat: IDM) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  );
}
