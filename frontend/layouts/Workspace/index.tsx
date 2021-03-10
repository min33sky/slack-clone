import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';

import ChannelModal from '@components/ChannelModal';
import WorkspaceModal from '@components/WorkspaceModal';
import useUserDataFetch from '@hooks/useUserDataFetch';
import useChannelsFetch from '@hooks/useChannelsFetch';
import InviteChannelModal from '@components/InviteChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceMenu,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './styles';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

/**
 * 워크스페이스
 */
function Workspace() {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData, revalidate } = useUserDataFetch({});
  const { data: channelData } = useChannelsFetch({ userData, workspace });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, { withCredentials: true }).then(() => revalidate());
  }, [revalidate]);

  const onClickUserProfile = useCallback((e: React.MouseEvent) => {
    // ? 이벤트 버블링을 막아서 메뉴 상태 변경이 계속 호출되는 것을 막는다.
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowWorkspaceModal(false);
    setShowInviteChannelModal(false);
    setShowInviteWorkspaceModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback((e) => {
    e.stopPropagation();
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  //* **************************************************************************************/

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <div role="presentation" onClick={onClickUserProfile}>
            <ProfileImg
              src={gravatar.url(userData.nickname, {
                s: '28x',
                d: 'retro',
              })}
              alt={userData.nickname}
            />
            {showUserMenu && (
              <Menu
                style={{ right: 0, top: 38 }}
                show={showUserMenu}
                onCloseModal={onClickUserProfile}
              >
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.nickname, {
                      s: '36px',
                      d: 'retro',
                    })}
                    alt={userData.nickname}
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </div>
        </RightMenu>
      </Header>

      <WorkspaceWrapper>
        <Workspaces>
          {userData &&
            userData.Workspaces.map((ws) => {
              return (
                <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
                  <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                </Link>
              );
            })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Slack</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}
              closeButton
            >
              <WorkspaceMenu>
                <h2>Slack</h2>
                <button type="button" onClick={onClickInviteWorkspace}>
                  워크스페이스에 사용자 초대
                </button>
                <button type="button" onClick={onClickAddChannel}>
                  채널 만들기
                </button>
                <button type="button" onClick={onLogout}>
                  로그아웃
                </button>
              </WorkspaceMenu>
            </Menu>

            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>

        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>

      <WorkspaceModal show={showCreateWorkspaceModal} onCloseModal={onCloseModal} />
      <ChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} />
      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} />
    </div>
  );
}

export default Workspace;
