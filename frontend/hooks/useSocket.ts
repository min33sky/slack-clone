import { useCallback } from 'react';
import io from 'socket.io-client';

const BACK_URL = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

/**
 * SocketIO Hook
 * @param workspace 워크스페이스 이름
 * @returns [소켓, 소캣 연결 종료 함수]
 */
const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) return [undefined, disconnect];

  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${BACK_URL}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
