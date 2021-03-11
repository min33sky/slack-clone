import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React from 'react';
import { ChatZone, Section } from './style';

interface IProps {
  chatData: IDM[];
}

export default function ChatList({ chatData }: IProps) {
  return (
    <ChatZone>
      {chatData.map((chat: IDM) => (
        <Chat key={chat.id} data={chat} />
      ))}
    </ChatZone>
  );
}
