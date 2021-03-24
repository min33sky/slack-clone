export interface IUser {
  id: number;
  nickname: string;
  email: string;
  Workspaces: IWorkspace[];
}

export interface IUserWithOnline extends IUser {
  online: boolean;
}

export interface IChannel {
  id: number;
  name: string;
  private: boolean; // 비공개 채널 여부
  WorkspaceId: number;
}

export interface IChat {
  id: number;
  UserId: number;
  User: IUser; // 보낸 사람
  content: string;
  createdAt: Date;
  ChannelId: number;
  Channel: IChannel;
}

/**
 * 다이렉트 메세지 타입
 */
export interface IDM {
  id: number;
  SenderId: number; // 보낸사람 ID
  Sender: IUser;
  ReceiverId: number; // 받는사람 ID
  Receiver: IUser;
  content: string;
  createdAt: Date;
}

export interface IWorkspace {
  id: number;
  name: string;
  url: string; // 주소 창에 보이는 주소
  OwnerId: number; // 워크스페이스 만든 사람 ID
}
