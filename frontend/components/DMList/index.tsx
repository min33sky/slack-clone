import useSocket from '@hooks/useSocket';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { IDM, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetch';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import useSWR from 'swr';
import CollapseButton from './style';

/**
 * Direct Message List
 */
export default function DMList() {
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();

  // 내 정보
  const { data: userData } = useUserDataFetch({ dedupingInterval: 2000 });

  // 현재 접속한 워크스페이스의 회원 정보
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  );

  // 접속중인 맴버 버튼
  const [channelCollapse, setChannelCollapse] = useState(false);

  // 접속자 별 미확인 메세지 개수 리스트
  const [messageCountList, setMessageCountList] = useState<{ [key: string]: number }>({});

  // 현재 접속중인 DM채널 ID
  const [currentDMChannelId, setCurrentDMChannelId] = useState(0);

  // 온라인 접속중인 맴버 리스트
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const [socket] = useSocket(workspace);

  useEffect(() => {
    // 현재 접속중인 DM Channel ID 설정
    const channelId = parseInt(location.pathname.split('/')[4], 10);
    setCurrentDMChannelId(channelId);
  }, [location, userData]);

  const onMessage = useCallback(
    (data: IDM) => {
      if (data.SenderId !== currentDMChannelId) {
        setMessageCountList((list) => {
          return {
            ...list,
            [data.SenderId]: list[data.SenderId] ? list[data.SenderId] + 1 : 1,
          };
        });
      }
    },
    [currentDMChannelId]
  );

  // ? 워크스페이스에 접속한 인원을 초기화 & 메세지 받은 개수 초기화
  useEffect(() => {
    console.log('[DMList] 현재 워크스페이스 이름: ', workspace);
    setOnlineList([]);
    setMessageCountList({});
  }, [workspace]);

  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      console.log('[DMList] 접속중인 이용자 리스트', data);
      setOnlineList(data);
    });
    socket?.on('dm', onMessage);
    console.log('socket on dm', socket?.hasListeners('dm'), socket);
    return () => {
      socket?.off('dm', onMessage);
      console.log('socket off dm', socket?.hasListeners('dm'));
      socket?.off('onlineList');
    };
  }, [socket, onMessage]);

  /**
   * DirectMessage 리스트 버튼 핸들러
   */
  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  /**
   * 미확인 메세지 수신 확인
   */
  const resetCount = useCallback(
    (id) => () => {
      setMessageCountList((list) => {
        return {
          ...list,
          [id]: 0,
        };
      });
    },
    []
  );

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
        <span>Direct Messages</span>
      </h2>

      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            const count = messageCountList[member.id] || 0;

            return (
              <NavLink
                key={member.id}
                activeClassName="selected"
                to={`/workspace/${workspace}/dm/${member.id}`}
                onClick={resetCount(member.id)}
              >
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline
                      ? 'c-presence--active c-icon--presence-online'
                      : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span className={count > 0 ? 'bold' : undefined}>{member.nickname}</span>
                {member.id === userData?.id && <span>(나)</span>}
                {count > 0 && <span className="count">{count}</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
}
