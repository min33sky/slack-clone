import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Container, DragOver, Header } from '@pages/Channel/style';
import { IChannel, IChat } from '@typings/db';
import fetcher from '@utils/fetch';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Redirect, useParams } from 'react-router-dom';
import useSWR, { useSWRInfinite } from 'swr';
import InviteChannelModal from '@components/InviteChannelModal';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;

/**
 * 채널 페이지
 */
export default function Channel() {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const { data: userData } = useUserDataFetch({});
  const { data: channelsData } = useSWR<IChannel[]>(
    `/api/workspaces/${workspace}/channels`,
    fetcher
  );

  const channelData = channelsData?.find((data) => data.name === channel);

  const { data: channelMembersData } = useSWR(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher
  );

  // 채팅 리스트의 스크롤바 제어를 위한 Ref
  const scrollbarRef = useRef<Scrollbars>(null);

  // 인피니티 스크롤링 관련
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
    (index) =>
      `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${
        index + 1
      }`,
    fetcher,
    {
      // ? 데이터 로딩 후 스크롤바를 제일 아래로 내려준다
      onSuccess(data) {
        console.log('[Channel] 채팅 데이터: ', data);
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

  // 채널 초대 모달 상태
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  // 이미지 업로드 드래그 상태
  const [dragOver, setDragOver] = useState(false);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData && userData) {
        // ?  Optimistic UI 적용 (화면에 일단 반영하고 서버로 보내기)
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: userData.id,
            User: userData,
            ChannelId: channelData?.id,
            Channel: channelData,
            createdAt: new Date(),
          });

          return prevChatData;
        }, false)
          .then(() => {
            localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
            setChat('');
            if (scrollbarRef.current) {
              console.log('[Channel] scrollToBottom!', scrollbarRef.current?.getValues());
              scrollbarRef.current.scrollToBottom();
            }
          })
          .finally(() => {
            console.log('메세지를 전송했어요');
          });

        axios
          .post(
            `/api/workspaces/${workspace}/channels/${channel}/chats`,
            {
              content: savedChat,
            },
            {
              withCredentials: true,
            }
          )
          .then(() => {
            // TODO: 필요 없을 수도
            revalidate();
          })
          .catch(console.error);
      }
    },
    [channel, channelData, chat, chatData, mutateChat, revalidate, setChat, userData, workspace]
  );

  // 채팅 메세지 이벤트 핸들러
  const onMessage = useCallback(
    (data: IChat) => {
      console.log('***** 메세지가 도착했습니다....... *****');
      // ? 내가 보낸 메세지는 제외한다. (이미 화면에 표시된 상태기 때문에)
      if (
        data.Channel.name === channel &&
        (data.content.startsWith('uploads\\') || data.UserId !== userData?.id)
      ) {
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
              console.log('[Channel] scrollToBottom!', scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
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
    [channel, userData, mutateChat]
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  // useEffect(() => {
  //   localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  // }, [workspace, channel]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

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
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
      });
    },
    [workspace, channel]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  }, []);

  // TODO: 채팅 입력시마다 계속 함수 호출되므로 useCallback으로 처리해야 함
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  // if (!userData) {
  //   return null;
  // }

  if (channelsData && !channelData) {
    return <Redirect to={`/workspace/${workspace}/channel/일반`} />;
  }

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            type="button"
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            onClick={onClickInviteChannel}
          >
            <i
              className="c-icon p-ia__view_header__button_icon c-icon--add-user"
              aria-hidden="true"
            />
          </button>
        </div>
      </Header>

      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />

      <ChatBox
        chat={chat}
        onSubmitForm={onSubmitForm}
        onChangeChat={onChangeChat}
        placeholder={`Message #${channel}`}
      />

      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
}
