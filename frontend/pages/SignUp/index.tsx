import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Label, Input, Button, LinkContainer } from './style';

/**
 * 회원 가입 페이지
 * /signup
 */
export default function SignUp() {
  return (
    <Container>
      <header>SLACK</header>
      <Form onSubmit={() => {}}>
        <Label>
          <span>이메일 주소</span>
          <Input type='email' />
        </Label>
        <Label>
          <span>닉네임</span>
          <div>
            <Input type='email' />
          </div>
        </Label>
        <Label>
          <span>비밀번호</span>
          <div>
            <Input type='email' />
          </div>
        </Label>
        <Label>
          <span>비밀번호 확인</span>
          <div>
            <Input type='email' />
          </div>
        </Label>
        <Button type='submit'>회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요? <Link to='/login'>로그인 하러 가기</Link>
      </LinkContainer>
    </Container>
  );
}
