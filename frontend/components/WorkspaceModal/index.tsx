import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/style';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetch';
import axios, { AxiosError } from 'axios';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

export default function WorkspaceModal({ show, onCloseModal }: IProps) {
  // 로그인 사용자 데이터 fetch
  const { data: userData, revalidate } = useSWR<IUser | false>(
    'http://localhost:3095/api/users',
    fetcher
  );

  const { workspace } = useParams<{ workspace: string }>();

  // 워크스페이스에 속한 채널들을 fetch
  const { data: channelData } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const [newWorkspace, setNewWorkspace] = useState('');
  const [newUrl, setNewUrl] = useState('');

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
          setNewWorkspace('');
          setNewUrl('');
          onCloseModal();
          toast.success('워크스페이스 생성 완료 :)', { position: 'bottom-center' });
        })
        .catch((error: AxiosError) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newUrl, newWorkspace, revalidate, onCloseModal]
  );
  const onChangeNewWorkspace = useCallback((e) => {
    setNewWorkspace(e.target.value);
  }, []);

  const onChangeNewUrl = useCallback((e) => {
    setNewUrl(e.target.value);
  }, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
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
  );
}
