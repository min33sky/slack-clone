import Modal from '@components/Modal';
import useChannelsFetch from '@hooks/useChannelsFetch';
import useInput from '@hooks/useInput';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Button, Input, Label } from '@pages/SignUp/style';
import axios, { AxiosError } from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 채널 생성 모달
 * @param show 모달 보여주기
 * @param onCloseModal 모달 종료 함수
 */
export default function ChannelModal({ show, onCloseModal }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();

  const { data: userData } = useUserDataFetch({});
  const { data: channelData, revalidate: revalidateChannel } = useChannelsFetch({
    userData,
    workspace,
  });

  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');

  /**
   * 채널 생성 함수
   */
  const onCreateChannel = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      axios
        .post(
          `/api/workspaces/${workspace}/channels`,
          {
            name: newChannel,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          revalidateChannel(); // 채널 목록을 다시 fetch
          setNewChannel('');
          onCloseModal();
          toast.success('채널 생성 완료 :)', { position: 'bottom-center' });
        })
        .catch((error: AxiosError) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newChannel, setNewChannel, onCloseModal, workspace, revalidateChannel]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
}
