import fetcher from '@utils/fetch';
import axios from 'axios';
import React, { useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import useSWR from 'swr';

interface IProps {
  children: React.ReactNode;
}

function Workspace({ children }: IProps) {
  const { data, error, mutate } = useSWR('http://localhost:3095/api/users', fetcher);

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, { withCredentials: true })
      .then(() => mutate(false, false)); // ? mutate의 두 번째 인자 shouldRevalidate를 false로 설정하면 data값을 서버에 확인하지 않고 바꿀 수 있다.
  }, [mutate]);

  if (!data) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <button type="button" onClick={onLogout}>
        로그아웃
      </button>
      {children}
    </>
  );
}

export default Workspace;
