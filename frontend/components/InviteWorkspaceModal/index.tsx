import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Button, Input, Label } from '@pages/SignUp/style';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetch';
import axios, { AxiosError } from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 워크스페이스 초대 모달
 * @param show 모달 활성화 유무
 * @param onCloseModal 모달 종료 함수
 */
export default function InviteWorkspaceModal({ show, onCloseModal }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();

  const { data: userData } = useUserDataFetch();

  // ? 현 워크스페이스에 접속해 있는 사용자들의 정보를 가져온다.
  const { revalidate: revalidateMembers } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  );

  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const onInviteMember = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;

      axios
        .post(
          `/api/workspaces/${workspace}/members`,
          {
            email: newMember,
          },
          { withCredentials: true }
        )
        .then(() => {
          revalidateMembers();
          setNewMember('');
          onCloseModal();
          toast.success('현 워크스페이스로 초대했습니다. :)', { position: 'bottom-center' });
        })
        .catch((error: AxiosError) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newMember, onCloseModal, revalidateMembers, setNewMember, workspace]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
}
