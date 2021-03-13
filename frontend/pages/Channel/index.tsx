import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Container, Header } from '@pages/Channel/style';
import { IChannel, IChat, IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetch';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { useParams } from 'react-router-dom';
import useSWR, { useSWRInfinite } from 'swr';
import gravatar from 'gravatar';
import InviteChannelModal from '@components/InviteChannelModal';

/**
 * 채널 페이지
 */
export default function Channel() {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const { data: myData } = useUserDataFetch({});
  const { data: channelData } = useSWR<IChannel>(
    `/api/workspaces/${workspace}/channels/${channel}`,
    fetcher
  );
  const { data: channelMembersData } = useSWR(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher
  );

  // 인피니티 스크롤링 관련
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IChat[]>(
    (index) =>
      `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  // 채널 초대 모달 상태
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  // 채팅 리스트의 스크롤바 제어를 위한 Ref
  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData && myData) {
        // ?  Optimistic UI 적용 (화면에 일단 반영하고 서버로 보내기)
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData?.id,
            Channel: channelData,
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
            `/api/workspaces/${workspace}/channels/${channel}/chats`,
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
    [setChat, chat, workspace, revalidate, chatData, mutateChat, myData, channelData, channel]
  );

  // DM 이벤트 핸들러
  const onMessage = useCallback(
    (data: IChat) => {
      console.log('***** 메세지가 도착했습니다....... *****');
      // ? 내가 보낸 메세지는 제외한다. (이미 화면에 표시된 상태기 때문에)
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
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
    [channel, myData, mutateChat]
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, myData, onMessage]);

  // ? 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    console.log('챗데이터', chatData);
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  // TODO: 채팅 입력시마다 계속 함수 호출되므로 useCallback으로 처리해야 함
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  if (!myData) {
    return null;
  }

  return (
    <Container>
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
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />

      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} placeholder="" />

      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} />
    </Container>
  );
}
