import { IDM } from '@typings/db';
import dayjs from 'dayjs';

/**
 * 채팅 데이터를 날짜별로 분류하는 함수
 * @param chatList 채팅 데이터 리스트
 * @returns 날짜별로 필터링 된 채팅 데이터 객체
 */
export default function makeSection(chatList: IDM[]) {
  const sections: { [key: string]: IDM[] } = {};

  chatList.forEach((chat: IDM) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}
