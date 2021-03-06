import React, { useCallback, useState } from 'react';
import useInput from '@hooks/useInput';
import { Link, Redirect } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import useUserDataFetch from '@hooks/useUserDataFetch';
import { Container, Form, Label, Input, Button, LinkContainer, Error, Success } from './style';

/**
 * 회원 가입 페이지
 * /signup
 */
export default function SignUp() {
  const { data } = useUserDataFetch({});

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, , setPassword] = useInput('');
  const [passwordCheck, , setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const onChangePassword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck, setPassword]
  );

  const onChangePasswordCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password, setPasswordCheck]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!mismatchError && nickname) {
        setSignUpError('');
        setSignUpSuccess(false);
        axios
          .post('/api/users', {
            email,
            nickname,
            password,
          })
          .then((_response) => {
            setSignUpSuccess(true);
          })
          .catch((error: AxiosError) => {
            console.log(error.response);
            setSignUpError(error.response?.data);
          })
          .finally(() => {});
      }
    },
    [email, mismatchError, nickname, password]
  );

  // ? 데이터가 존재하지 않을 경우는 false이므로 !data를 사용하지 않는다.
  if (data === undefined) {
    return <p>로딩중....</p>;
  }

  if (data) {
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

  return (
    <Container>
      <header>SLACK</header>
      <Form onSubmit={onSubmit}>
        <Label>
          <span>이메일 주소</span>
          <Input type="email" name="email" id="email" value={email} onChange={onChangeEmail} />
        </Label>

        <Label>
          <span>닉네임</span>
          <div>
            <Input
              type="text"
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={onChangeNickname}
            />
          </div>
        </Label>

        <Label>
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
        </Label>

        <Label>
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="passwordCheck"
              name="passwordCheck"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입 완료! 로그인해주세요</Success>}
        </Label>

        <Button type="submit">회원가입</Button>
      </Form>

      <LinkContainer>
        이미 회원이신가요? <Link to="/login">로그인 하러 가기</Link>
      </LinkContainer>
    </Container>
  );
}
