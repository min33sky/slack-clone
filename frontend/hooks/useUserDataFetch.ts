import { IUser } from '@typings/db';
import useSWR, { ConfigInterface } from 'swr';
import fetcher from '@utils/fetch';

const API_URL = '/api/users';

interface IProps extends ConfigInterface {}

/**
 * SWR User Data Fetch Hook
 * @param options Fetch Options
 */
export default function useUserDataFetch({ ...props }: IProps) {
  const { data, mutate, revalidate } = useSWR<IUser>(API_URL, fetcher, { ...props });

  return {
    data,
    mutate,
    revalidate,
  };
}
