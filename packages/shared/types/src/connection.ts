export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked' | 'removed';

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  userId: string;
  message?: string;
}
