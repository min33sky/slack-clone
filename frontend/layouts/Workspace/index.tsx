import fetcher from '@utils/fetch';
import axios, { AxiosError } from 'axios';
import React, { SyntheticEvent, useCallback, useState } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import { IChannel, IUser } from '@typings/db';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import { toast } from 'react-toastify';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/style';
import CreateChannelModal from '@components/CreateChannelModal';
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
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './styles';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

function Workspace() {
  const { data: userData, mutate, revalidate } = useSWR<IUser | false>(
    'http://localhost:3095/api/users',
    fetcher
  );

  const { workspace } = useParams<{ workspace: string }>();

  const { data: channelData } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);

  const [newWorkspace, setNewWorkspace] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, { withCredentials: true })
      .then(() => mutate(false, false)); // ? mutate의 두 번째 인자 shouldRevalidate를 false로 설정하면 data값을 서버에 확인하지 않고 바꿀 수 있다.
  }, [mutate]);

  const onClickUserProfile = useCallback((e: SyntheticEvent) => {
    // ? 이벤트 버블링을 막아서 메뉴 상태 변경이 계속 호출되는 것을 막는다.
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onChangeNewWorkspace = useCallback((e) => {
    setNewWorkspace(e.target.value);
  }, []);

  const onChangeNewUrl = useCallback((e) => {
    setNewUrl(e.target.value);
  }, []);

  const onCreateWorkspace = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;
      axios
        .post(
          'http://localhost:3095/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          { withCredentials: true }
        )
        .then(() => {
          revalidate();
          setShowCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((error: AxiosError) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newUrl, newWorkspace, revalidate]
  );

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(
    (e) => {
      e.stopPropagation();
      console.log('zz', showWorkspaceModal);
      setShowWorkspaceModal((prev) => !prev);
    },
    [showWorkspaceModal]
  );

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  //* ************************************************************************* */

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span role="presentation" onClick={onClickUserProfile}>
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
                    src={gravatar.url(userData.nickname, { s: '36px', d: 'retro' })}
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
          </span>
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
              <WorkspaceModal>
                <h2>Slack</h2>
                <button type="button" onClick={onClickAddChannel}>
                  채널 만들기
                </button>
                <button type="button" onClick={onLogout}>
                  로그아웃
                </button>
              </WorkspaceModal>
            </Menu>
            {channelData?.map((v) => (
              <div>{v.name}</div>
            ))}
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>

      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace-url" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
    </div>
  );
}

export default Workspace;
