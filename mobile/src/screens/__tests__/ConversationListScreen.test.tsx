/**
 * ConversationListScreen Tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ConversationListScreen } from '../ConversationListScreen';
import * as messageService from '../../services/messageService';

// Mock the message service
jest.mock('../../services/messageService');

describe('ConversationListScreen', () => {
  const mockOnConversationPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (messageService.getConversations as jest.Mock).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    );

    const { UNSAFE_queryAllByType } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    // Check for ActivityIndicator (loading spinner)
    const activityIndicators = UNSAFE_queryAllByType('ActivityIndicator' as any);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  it('renders empty state when no conversations', async () => {
    (messageService.getConversations as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    await waitFor(() => {
      expect(getByText('No conversations yet')).toBeTruthy();
    });
  });

  it('renders conversation list successfully', async () => {
    const mockConversations = [
      {
        connection: {
          id: 'conn-1',
          sponsor_id: 'user-1',
          sponsee_id: 'user-2',
          sponsor: { id: 'user-1', name: 'John Sponsor' },
          sponsee: { id: 'user-2', name: 'Jane Sponsee' },
          status: 'active',
        },
        lastMessage: {
          id: 'msg-1',
          text: 'Hello there!',
          created_at: '2024-01-01T12:00:00Z',
        },
        unreadCount: 2,
      },
    ];

    (messageService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

    const { getByText } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    await waitFor(() => {
      expect(getByText('Jane Sponsee')).toBeTruthy();
      expect(getByText('Hello there!')).toBeTruthy();
    });
  });

  it('displays unread count badge', async () => {
    const mockConversations = [
      {
        connection: {
          id: 'conn-1',
          sponsor_id: 'user-1',
          sponsee_id: 'user-2',
          sponsor: { id: 'user-1', name: 'John Sponsor' },
          sponsee: { id: 'user-2', name: 'Jane Sponsee' },
          status: 'active',
        },
        lastMessage: {
          id: 'msg-1',
          text: 'Hello there!',
          created_at: '2024-01-01T12:00:00Z',
        },
        unreadCount: 3,
      },
    ];

    (messageService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

    const { getByText } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    await waitFor(() => {
      expect(getByText('3')).toBeTruthy(); // Unread count badge
    });
  });

  it('displays error message on failure', async () => {
    (messageService.getConversations as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    await waitFor(() => {
      expect(getByText(/Network error|Failed to load/i)).toBeTruthy();
    });
  });

  it('handles empty last message gracefully', async () => {
    const mockConversations = [
      {
        connection: {
          id: 'conn-1',
          sponsor_id: 'user-1',
          sponsee_id: 'user-2',
          sponsor: { id: 'user-1', name: 'John Sponsor' },
          sponsee: { id: 'user-2', name: 'Jane Sponsee' },
          status: 'active',
        },
        lastMessage: undefined,
        unreadCount: 0,
      },
    ];

    (messageService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

    const { getByText } = render(
      <ConversationListScreen onConversationPress={mockOnConversationPress} />
    );

    await waitFor(() => {
      expect(getByText('Jane Sponsee')).toBeTruthy();
      expect(getByText('No messages yet')).toBeTruthy();
    });
  });
});
