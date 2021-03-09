import CollapseButton from '@components/DMList/style';
import useChannelsFetch from '@hooks/useChannelsFetch';
import useUserDataFetch from '@hooks/useUserDataFetch';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

/**
 * 채널 리스트
 */
export default function ChannelList() {
  const { workspace } = useParams<{ workspace?: string }>();

  const location = useLocation();

  const { data: userData } = useUserDataFetch({ dedupingInterval: 2000 });
  const { data: channelData } = useChannelsFetch({ userData, workspace });

  const [channelCollapse, setChannelCollapse] = useState(false);
  const [countList, setCountList] = useState<{ [key: string]: number | undefined }>({});

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

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

  // TODO: 워크스페이스가 바뀌면 countLIst를 초기화
  useEffect(() => {
    return () => {};
  }, []);

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
            const count = countList[`c-${channel.id}`];
            console.log(count);
            return (
              <NavLink
                key={channel.name}
                activeClassName="selected"
                to={`/workspace/${workspace}/channel/${channel.name}`}
                onClick={resetCount(`c-${channel.id}`)}
              >
                <span className={count !== undefined && count >= 0 ? 'bold' : undefined}>
                  # {channel.name}
                </span>
                {count !== undefined && count > 0 && <span className="count">{count}</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
}
