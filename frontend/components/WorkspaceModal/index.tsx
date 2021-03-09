import Modal from '@components/Modal';
import useChannelsFetch from '@hooks/useChannelsFetch';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Button, Input, Label } from '@pages/SignUp/style';
import axios, { AxiosError } from 'axios';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 워크스페이스 모달
 * @param show 모달 활성화 유무
 * @param onCloseModal 모달 종료 함수
 */
export default function WorkspaceModal({ show, onCloseModal }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();

  const { data: userData, revalidate } = useUserDataFetch({});
  const { data: channelData } = useChannelsFetch({ userData, workspace });

  const [newWorkspace, setNewWorkspace] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const onCreateWorkspace = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;
      axios
        .post(
          '/api/workspaces',
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
