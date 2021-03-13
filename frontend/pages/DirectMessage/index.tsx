import useUserDataFetch from '@hooks/useUserDataFetch';
import fetcher from '@utils/fetch';
import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import gravatar from 'gravatar';
import { IDM, IUser } from '@typings/db';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import { Scrollbars } from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import { Header, Container } from './style';

/**
 * 다이렉트 메세지 페이지
 * /workspace/:workspace/dm/:userID
 */
export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useUserDataFetch({});

  const [socket] = useSocket(workspace);

  const [chat, onChangeChat, setChat] = useInput('');

  // 인피니티 스크롤링 관련
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  // 채팅 리스트의 스크롤바 제어를 위한 Ref
  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && userData && myData) {
        // ?  Optimistic UI 적용 (화면에 일단 반영하고 서버로 보내기)
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });

          return prevChatData;
        }, false)
          .then(() => {
            setChat('');
            scrollbarRef.current?.scrollToBottom();
          })
          .finally(() => {
            console.log('메세지를 전송했어요');
          });

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
          })
          .catch(console.error);
      }
    },
    [setChat, id, chat, workspace, revalidate, chatData, mutateChat, myData, userData]
  );

  // DM 이벤트 핸들러
  const onMessage = useCallback(
    (data: IDM) => {
      console.log('***** DM이 도착했습니다....... *****');
      // ? 내가 보낸 메세지는 제외한다. (이미 화면에 표시된 상태기 때문에)
      // ? id는 DM 보낼 상대방의 ID이다.
      if (data.SenderId === Number(id) && myData?.id !== Number(id)) {
        mutateChat((currentChatData) => {
          currentChatData?.[0].unshift(data); // 가장 최신 데이터로 삽입한다.
          return currentChatData;
        }, false)
          .then(() => {
            // ? 특정 높이 이하일 때만 스크롤바를 아래로 내린다. (버그 좀 있음 :<)
            if (scrollbarRef.current) {
              if (
                scrollbarRef.current.getScrollHeight() <
                scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
              ) {
                console.log('scrollToBottom!', scrollbarRef.current?.getValues());
                setTimeout(() => {
                  scrollbarRef.current?.scrollToBottom();
                  console.log('내려갓');
                }, 50);
              } else {
                // toast.success('새 메시지가 도착했습니다.', {
                //   onClick() {
                //     scrollbarRef.current?.scrollToBottom();
                //   },
                //   closeOnClick: true,
                // });
              }
            }
          })
          .finally(() => {
            console.log('진짜 내려가');
            scrollbarRef.current?.scrollToBottom();
          });
      }
    },
    [id, mutateChat, myData]
  );

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, id, myData, onMessage]);

  // ? 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    console.log('챗데이터', chatData);
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  // TODO: 채팅 입력시마다 계속 함수 호출되므로 useCallback으로 처리해야 함
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

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

      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />

      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} placeholder="" />
    </Container>
  );
}
