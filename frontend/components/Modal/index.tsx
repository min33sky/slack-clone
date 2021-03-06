import React, { useCallback } from 'react';
import { CloseModalButton, Backdrop } from '@components/Modal/style';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
  children: React.ReactNode;
}

/**
 * 모달
 * @param show 모달을 보여줄 지 유무
 * @param onCloseModal 모달 종료 함수
 */
export default function Modal({ show, onCloseModal, children }: IProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) {
    return null;
  }

  return (
    <Backdrop onClick={onCloseModal}>
      <div role="presentation" onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </Backdrop>
  );
}
