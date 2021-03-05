import useInput from '@hooks/useInput';
import { Button, Container, Form, Input, Label, LinkContainer, Error } from '@pages/SignUp/style';
import fetcher from '@utils/fetch';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';

/**
 * 로그인 페이지
 * /login
 */
export default function Login() {
  const { data, error, revalidate, mutate } = useSWR('http://localhost:3095/api/users', fetcher, {
    // dedupingInterval: 20000, // ? 정해진 시간동안 요청을 보내지 않고 캐시된 값을 사용한다
  });
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLogInError(false);
      axios
        .post(
          'http://localhost:3095/api/users/login',
          { email, password },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log(response.data);
          revalidate(); // 다시 SWR 요청을 보낸다.
          // mutate(response.data, false); // ? 서버로 SWR 요청을 보내지않고 data 값을 교체한다
        })
        .catch((e) => {
          setLogInError(e.response?.data?.statusCode === 401);
        });
    },
    [email, password, mutate]
  );

  if (data === undefined) {
    return <p>로딩중....</p>;
  }

  if (data) {
    return <Redirect to="/workspace/channel" />;
  }

  return (
    <Container>
      <header>Sleact</header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </Container>
  );
}
