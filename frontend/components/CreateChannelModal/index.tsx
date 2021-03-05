import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/style';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetch';
import axios, { AxiosError } from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}

export default function CreateChannelModal({
  show,
  onCloseModal,
  setShowCreateChannelModal,
}: IProps) {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();

  const { data: userData, revalidate } = useSWR<IUser | false>(
    'http://localhost:3095/api/users',
    fetcher
  );

  const { data: channelData, revalidate: revalidateChannel } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const onCreateChannel = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios
        .post(
          `http://localhost:3095/api/workspaces/${workspace}/channels`,
          {
            name: newChannel,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          revalidateChannel();
          setShowCreateChannelModal(false);
          setNewChannel('');
          toast.success('채널을 만들었어요!!!', { position: 'bottom-center' });
          console.log('요시');
        })
        .catch((error: AxiosError) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newChannel, setNewChannel, setShowCreateChannelModal, workspace, revalidateChannel]
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
