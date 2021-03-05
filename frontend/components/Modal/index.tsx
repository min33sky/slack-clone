import { CloseModalButton } from '@components/Menu/style';
import React, { useCallback } from 'react';
import { CreateModal } from './style';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
  children: React.ReactNode;
}

export default function Modal({ show, onCloseModal, children }: IProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) {
    return null;
  }

  return (
    <CreateModal onClick={onCloseModal}>
      <div role="presentation" onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
}
