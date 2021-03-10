import useUserDataFetch from '@hooks/useUserDataFetch';
import { Container } from '@pages/SignUp/style';
import fetcher from '@utils/fetch';
import React from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import { IUser } from '@typings/db';
import { Header } from './style';

/**
 * 다이렉트 메세지 페이지
 */
export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useUserDataFetch({});

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
        {/* <ChatList />
        <ChatBox /> */}
      </Header>
    </Container>
  );
}
