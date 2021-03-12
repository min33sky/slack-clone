import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
import { ChatZone, Section, StickyHeader } from './style';

interface IProps {
  chatSections: { [key: string]: IDM[] };
  setSize: (_f: (_size: number) => number) => Promise<IDM[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

/**
 * 채팅 화면
 * @param chatSections 채팅 데이터 객체
 */
const ChatList = forwardRef<Scrollbars, IProps>(
  ({ chatSections, setSize, isEmpty, isReachingEnd }: IProps, ref) => {
    const onScroll = useCallback(
      (values: positionValues) => {
        if (values.scrollTop === 0 && !isReachingEnd) {
          console.log('가장 위');
          setSize((prevSize) => prevSize + 1).then(() => {
            // 스크롤 위치 유지
            const current = (ref as MutableRefObject<Scrollbars>)?.current;
            console.log('current', current);
            if (current) {
              current.scrollTop(current.getScrollHeight() - values.scrollHeight);
              console.log('getScrollHeight: ', current.getScrollHeight());
              console.log('values.scrollHeight: ', values.scrollHeight);
            }
          });
        }
      },
      [isReachingEnd, setSize, ref]
    );

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
