/**
 * Message Service Tests
 */

import { sendMessage, markMessageAsRead, getUnreadMessageCount } from '../messageService';
import { supabase, getCurrentUserId } from '../supabase';

// Mock the supabase module
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
  getCurrentUserId: jest.fn(),
}));

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('sends a message successfully', async () => {
      const mockUserId = 'user-123';
      const mockMessage = {
        id: 'msg-123',
        connection_id: 'conn-123',
        sender_id: mockUserId,
        recipient_id: 'user-456',
        text: 'Test message',
        created_at: '2024-01-01T12:00:00Z',
        read_at: null,
        archived: false,
      };

      (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);
      
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockMessage, error: null }),
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await sendMessage('conn-123', 'user-456', 'Test message');

      expect(result).toEqual(mockMessage);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.insert).toHaveBeenCalledWith({
        connection_id: 'conn-123',
        sender_id: mockUserId,
        recipient_id: 'user-456',
        text: 'Test message',
      });
    });

    it('throws error when user is not authenticated', async () => {
      (getCurrentUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        sendMessage('conn-123', 'user-456', 'Test message')
      ).rejects.toThrow('User not authenticated');
    });

    it('throws error when message exceeds 2000 characters', async () => {
      const mockUserId = 'user-123';
      (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);

      const longMessage = 'a'.repeat(2001);

      await expect(
        sendMessage('conn-123', 'user-456', longMessage)
      ).rejects.toThrow('Message text cannot exceed 2000 characters');
    });
  });

  describe('markMessageAsRead', () => {
    it('marks a message as read successfully', async () => {
      const mockUserId = 'user-123';
      (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ error: null }),
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await markMessageAsRead('msg-123');

      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.update).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'msg-123');
      expect(mockChain.eq).toHaveBeenCalledWith('recipient_id', mockUserId);
    });

    it('throws error when user is not authenticated', async () => {
      (getCurrentUserId as jest.Mock).mockResolvedValue(null);

      await expect(markMessageAsRead('msg-123')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('getUnreadMessageCount', () => {
    it('returns unread message count successfully', async () => {
      const mockUserId = 'user-123';
      (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ count: 5, error: null }),
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const count = await getUnreadMessageCount();

      expect(count).toBe(5);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.eq).toHaveBeenCalledWith('recipient_id', mockUserId);
      expect(mockChain.is).toHaveBeenCalledWith('read_at', null);
    });

    it('returns 0 when no unread messages', async () => {
      const mockUserId = 'user-123';
      (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ count: null, error: null }),
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const count = await getUnreadMessageCount();

      expect(count).toBe(0);
    });

    it('throws error when user is not authenticated', async () => {
      (getCurrentUserId as jest.Mock).mockResolvedValue(null);

      await expect(getUnreadMessageCount()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });
});
