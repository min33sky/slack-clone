import React, { CSSProperties, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from './style';

interface IProps {
  children: React.ReactNode;
  style: CSSProperties;
  show: boolean;
  closeButton?: boolean;
  onCloseModal: (_e: React.MouseEvent) => void;
}

/**
 * 메뉴
 * @param param0
 * @param param0
 * @param param0
 * @param param0
 * @param param0
 */
export default function Menu({ children, style, show, onCloseModal, closeButton }: IProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) {
    return null;
  }

  return (
    <CreateMenu onClick={onCloseModal}>
      <div role="presentation" style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
}

Menu.defaultProps = {
  closeButton: true,
};
