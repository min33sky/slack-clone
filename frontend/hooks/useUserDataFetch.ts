import { IUser } from '@typings/db';
import useSWR from 'swr';
import fetcher from '@utils/fetch';

const API_URL = 'http://localhost:3095/api/users';

/**
 * SWR User Data Fetch Hook
 * dedupingInterval: 20000, // ? 정해진 시간동안 요청을 보내지 않고 캐시된 값을 사용한다
 */
export default function useUserDataFetch() {
  const { data, mutate, revalidate } = useSWR<IUser | false>(API_URL, fetcher);

  return {
    data,
    mutate,
    revalidate,
  };
}
