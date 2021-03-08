import { IUser, IChannel } from '@typings/db';
import useSWR from 'swr';
import fetcher from '@utils/fetch';

const API_URL = '/api/workspaces';

interface Iprops {
  userData: IUser | false | undefined;
  workspace: string;
}

/**
 * SWR Channel Data Fetch Hook
 * dedupingInterval: 20000, // ? 정해진 시간동안 요청을 보내지 않고 캐시된 값을 사용한다
 * @param userData 로그인 한 유저의 데이터
 * @param workspace 현재 workspace
 */
export default function useChannelsFetch({ userData, workspace }: Iprops) {
  const { data, mutate, revalidate } = useSWR<IChannel[] | null>(
    userData ? `${API_URL}/${workspace}/channels` : null,
    fetcher
  );

  return {
    data,
    mutate,
    revalidate,
  };
}
