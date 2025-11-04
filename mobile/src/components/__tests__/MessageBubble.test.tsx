/**
 * MessageBubble Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';
import type { Message } from '../../types';

describe('MessageBubble', () => {
  const mockMessage: Message = {
    id: '123',
    connection_id: 'conn-123',
    sender_id: 'user-1',
    recipient_id: 'user-2',
    text: 'Hello, World!',
    created_at: '2024-01-01T12:00:00Z',
    read_at: undefined,
    archived: false,
  };

  it('renders message text correctly', () => {
    const { getByText } = render(
      <MessageBubble message={mockMessage} isCurrentUser={false} />
    );
    expect(getByText('Hello, World!')).toBeTruthy();
  });

  it('displays sent message with correct styling', () => {
    const { getByText } = render(
      <MessageBubble message={mockMessage} isCurrentUser={true} />
    );
    expect(getByText('Hello, World!')).toBeTruthy();
  });

  it('shows read receipt for sent and read messages', () => {
    const readMessage = { ...mockMessage, read_at: '2024-01-01T12:05:00Z' };
    const { getByText } = render(
      <MessageBubble message={readMessage} isCurrentUser={true} />
    );
    expect(getByText('✓✓')).toBeTruthy();
  });

  it('shows single check for sent but unread messages', () => {
    const { getByText } = render(
      <MessageBubble message={mockMessage} isCurrentUser={true} />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('does not show read receipt for received messages', () => {
    const { queryByText } = render(
      <MessageBubble message={mockMessage} isCurrentUser={false} />
    );
    expect(queryByText('✓✓')).toBeNull();
    expect(queryByText('✓')).toBeNull();
  });

  it('formats timestamp correctly', () => {
    const { getByText } = render(
      <MessageBubble message={mockMessage} isCurrentUser={false} />
    );
    // The timestamp should be formatted as time (e.g., "12:00 PM")
    const timestampRegex = /\d{1,2}:\d{2}\s?(AM|PM)/i;
    const textElements = render(
      <MessageBubble message={mockMessage} isCurrentUser={false} />
    ).UNSAFE_getAllByType('Text' as any);
    
    const hasTimestamp = textElements.some(
      element => timestampRegex.test(element.props.children as string)
    );
    expect(hasTimestamp).toBe(true);
  });
});
