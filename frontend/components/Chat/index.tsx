import { IChat, IDM } from '@typings/db';
import React, { useMemo } from 'react';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';
import ChatWrapper from './style';

interface IProps {
  data: IDM | IChat;
}

/**
 * 채팅 메세지
 * @param data 채팅 데이터
 */
function Chat({ data }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();
  const user = 'Sender' in data ? data.Sender : data.User;

  /**
   * ? 채팅 메세지의 닉네임 클릭시 DM 보내기 처리
   * - react-mention의 링크 태그 포멧 : @[닉네임](아이디)
   */
  const result = useMemo(
    () =>
      regexifyString({
        input: data.content,
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index) {
          console.log('채팅메세지 정규표현식 적용: ', match, data.content);
          const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
          // ? @닉네임(아이디)를 링크태그로 설정
          if (arr) {
            return (
              <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                @{arr[1]}
              </Link>
            );
          }
          // ? 줄바꿈을 br태그로 변경
          return <br key={index} />;
        },
      }),
    [data.content, workspace]
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>

      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname} </b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
}

export default React.memo(Chat);
