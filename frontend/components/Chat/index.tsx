import { IDM } from '@typings/db';
import React from 'react';
import gravatar from 'gravatar';
import ChatWrapper from './style';

interface IProps {
  data: IDM;
}
export default function Chat({ data }: IProps) {
  const user = data.Sender;
  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{data.createdAt}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  );
}
