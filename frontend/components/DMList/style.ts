import styled from '@emotion/styled';

interface IProps {
  collapse: boolean;
}

// eslint-disable-next-line prettier/prettier
const CollapseButton = styled.button<IProps>`
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-left: 10px;
  cursor: pointer;

  ${({ collapse }) =>
    collapse &&
    `& i {
      transform: none;
    }
  `};
`;

export default CollapseButton;
