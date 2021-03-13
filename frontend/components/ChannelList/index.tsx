import CollapseButton from '@components/DMList/style';
import useChannelsFetch from '@hooks/useChannelsFetch';
import useSocket from '@hooks/useSocket';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { IChat } from '@typings/db';
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

/**
 * 채널 리스트
 * TODO: 현재 채널에서 메세지를 받을 땐 메세지 숫자를 표시하지 말자
 */
export default function ChannelList() {
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();

  const [socket] = useSocket(workspace);

  // 접속자 데이터
  const { data: userData } = useUserDataFetch({ dedupingInterval: 2000 });
  // 채널 데이터
  const { data: channelData } = useChannelsFetch({ userData, workspace });

  // 채널 버튼 상태
  const [channelCollapse, setChannelCollapse] = useState(false);

  // 각 채널의 미확인 메세지 개수 리스트
  const [countList, setCountList] = useState<{ [key: string]: number | undefined }>({});
  // 메세기 개수 표시 유무
  const [isShown, setIsShown] = useState(false);

  // 현재 채널의 ID
  const [currentChannelId, setCurrentChannelId] = useState(0);

  // 채널 버튼 핸들러
  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  /**
   * 채널의 메세지 개수 초기화
   * @param id 채널 아이디
   */
  const resetCount = useCallback(
    (id) => () => {
      setCountList((list) => {
        return {
          ...list,
          [id]: undefined,
        };
      });
    },
    []
  );

  useEffect(() => {
    console.log('[channelList] workspace 변경: ', workspace);
    console.log('[channelList] countList 초기화');
    setCountList({});
  }, [workspace]);

  /**
   * 채팅 메세지 핸들러
   */
  const onMessage = useCallback(
    (data: IChat) => {
      console.log('[channelList] 메세지 도착: ', data);

      if (data.ChannelId !== currentChannelId) {
        setIsShown(true);

        setCountList((list) => {
          return {
            ...list,
            [`c-${data.ChannelId}`]: (list[`c-${data.ChannelId}`] || 0) + 1,
          };
        });
      } else {
        setIsShown(false);
      }
    },
    [currentChannelId]
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    // console.log('socket on message: ', socket?.hasListeners('message'));
    return () => {
      socket?.off('message', onMessage);
      // console.log('socket off message: ', socket?.hasListeners('message'));
    };
  }, [socket, onMessage]);

  // 현재 채널 ID 설정
  useEffect(() => {
    const channelName = location.pathname.split('/')[4];
    setCurrentChannelId(channelData?.find((item) => item.name === channelName)?.id || 0);
  }, [channelData, location]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Channels</span>
      </h2>

      <div>
        {!channelCollapse &&
          channelData?.map((channel) => {
            const messageCount = countList[`c-${channel.id}`];

            return (
              <NavLink
                key={channel.name}
                activeClassName="selected"
                to={`/workspace/${workspace}/channel/${channel.name}`}
                onClick={resetCount(`c-${channel.id}`)}
              >
                <span
                  className={messageCount !== undefined && messageCount >= 0 ? 'bold' : undefined}
                >
                  # {channel.name}
                </span>

                {isShown && messageCount !== undefined && messageCount > 0 && (
                  <span className="count">{messageCount}</span>
                )}
              </NavLink>
            );
          })}
      </div>
    </>
  );
}
