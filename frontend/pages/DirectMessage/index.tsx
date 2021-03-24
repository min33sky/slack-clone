import useUserDataFetch from '@hooks/useUserDataFetch';
import fetcher from '@utils/fetch';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { toast } from 'react-toastify';
import { DragOver } from '@pages/Channel/style';
import { Header, Container } from './style';

const PAGE_SIZE = 20;

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

  // 채팅 리스트의 스크롤바 제어를 위한 Ref
  const scrollbarRef = useRef<Scrollbars>(null);

  // 이미지 업로드 상태
  const [dragOver, setDragOver] = useState(false);

  // 인피니티 스크롤링 관련
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
    (index) =>
      `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
    {
      onSuccess(data) {
        if (data?.length === 1) {
          setTimeout(() => {
            scrollbarRef.current?.scrollToBottom();
          }, 100);
        }
      },
    }
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE) || false;

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
            localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
            setChat('');
            if (scrollbarRef.current) {
              console.log('scrollToBottom!', scrollbarRef.current?.getValues());
              scrollbarRef.current.scrollToBottom();
            }
          })
          .finally(() => {
            console.log('DM 전송했어요');
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
        }, false).then(() => {
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
              toast.success('새 메시지가 도착했습니다.', {
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
                closeOnClick: true,
              });
            }
          }
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
  }, [socket, onMessage]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
  }, [workspace, id]);

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      console.log(e);
      const formData = new FormData();
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            console.log(`... file[${i}].name = ${file.name}`);
            formData.append('image', file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          console.log(`... file[${i}].name = ${e.dataTransfer.files[i].name}`);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
        revalidate();
      });
    },
    [workspace, revalidate, id]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  if (!userData || !myData) {
    return null;
  }

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
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
        isReachingEnd={isReachingEnd}
      />

      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} placeholder="" />
      {dragOver && <DragOver onClick={() => setDragOver(false)}>업로드!</DragOver>}
    </Container>
  );
}
