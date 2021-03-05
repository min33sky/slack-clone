import React, { BaseSyntheticEvent, CSSProperties, SyntheticEvent, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from './style';

interface IProps {
  children: React.ReactNode;
  style: CSSProperties;
  show: boolean;
  closeButton?: boolean;
  onCloseModal: (e: SyntheticEvent) => void;
}

export default function Menu({ children, style, show, onCloseModal, closeButton }: IProps) {
  const stopPropagation = useCallback((e: BaseSyntheticEvent) => {
    console.log('클릭');
    e.stopPropagation();
  }, []);

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
}

Menu.defaultProps = {
  closeButton: true,
};
