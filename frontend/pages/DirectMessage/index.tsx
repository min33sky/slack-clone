import useUserDataFetch from '@hooks/useUserDataFetch';
import fetcher from '@utils/fetch';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import { IDM, IUser } from '@typings/db';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { Header, Container } from './style';

/**
 * 다이렉트 메세지 페이지
 */
export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useUserDataFetch({});

  const [chat, onChangeChat, setChat] = useInput('');

  const { data: chatData, revalidate } = useSWR<IDM[]>(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher
  );

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log('submit', chat);
      if (chat?.trim()) {
        axios
          .post(
            `/api/workspaces/${workspace}/dms/${id}/chats`,
            {
              content: chat,
            },
            {
              withCredentials: true,
            }
          )
          .then(() => {
            revalidate();
            setChat('');
          })
          .catch(console.error);
      }
    },
    [setChat, id, chat, workspace, revalidate]
  );

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>

      <ChatList />
      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} placeholder="" />
    </Container>
  );
}
