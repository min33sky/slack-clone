import Chat from '@components/Chat';
import { IChat, IDM } from '@typings/db';
import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
import { ChatZone, Section, StickyHeader } from './style';

interface IProps {
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (_f: (_size: number) => number) => Promise<IDM[][] | IChat[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

/**
 * 채팅 화면
 * @param chatSections 채팅 데이터 객체
 */
const ChatList = forwardRef<Scrollbars, IProps>(
  ({ chatSections, setSize, isEmpty, isReachingEnd }: IProps, ref) => {
    /**
     * 스크롤 제어 핸들러
     */
    const onScroll = useCallback(
      (values: positionValues) => {
        // 이전 데이터가 존재할 시 데이터를 불러온다.
        if (values.scrollTop === 0 && !isReachingEnd) {
          console.log('가장 위');
          setSize((prevSize) => prevSize + 1)
            .then(() => {
              // ? 데이터를 로드해도 현재 스크롤 위치를 유지시킨다.
              const current = (ref as MutableRefObject<Scrollbars>)?.current;
              console.log('current', current);
              if (current) {
                current.scrollTop(current.getScrollHeight() - values.scrollHeight);
                console.log('getScrollHeight: ', current.getScrollHeight());
                console.log('values.scrollHeight: ', values.scrollHeight);
                console.log('결과: ', current.getScrollHeight() - values.scrollHeight);
              }
            })
            .catch((e) => console.log(e));
        }
      },
      [isReachingEnd, setSize, ref]
    );

    // console.log('!@#!@#!@#!@#!@#!@# 아이디 순으로 정렬해야할 듯???????', chatSections);

    return (
      <ChatZone>
        <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats]) => {
            return (
              <Section className={`section-${date}`} key={date}>
                <StickyHeader>
                  <button type="button">{date}</button>
                </StickyHeader>

                {chats.map((chat) => (
                  <Chat key={chat.id} data={chat} />
                ))}
              </Section>
            );
          })}
        </Scrollbars>
      </ChatZone>
    );
  }
);

export default ChatList;
