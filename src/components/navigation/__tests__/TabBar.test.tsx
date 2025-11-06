/**
 * TabBar Component Tests
 * Feature: 002-app-screens
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../../../theme/ThemeContext';
import { TabBar } from '../TabBar';
import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from '../../../store/messages/messagesSlice';
import connectionsReducer from '../../../store/connections/connectionsSlice';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Mock store with initial state
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      messages: messagesReducer,
      connections: connectionsReducer,
    },
    preloadedState: {
      messages: {
        conversations: [],
        currentConversation: null,
        isLoading: false,
        isSending: false,
        isLoadingMore: false,
        error: null,
        ...overrides.messages,
      },
      connections: {
        activeConnections: [],
        pendingRequests: [],
        sentRequests: [],
        endedConnections: [],
        isLoading: false,
        isRefreshing: false,
        error: null,
        ...overrides.connections,
      },
    },
  });
};

// Mock navigation props
const createMockProps = (): BottomTabBarProps => ({
  state: {
    index: 0,
    routes: [
      { key: 'sobriety', name: 'sobriety', params: undefined },
      { key: 'matches', name: 'matches', params: undefined },
      { key: 'connections', name: 'connections', params: undefined },
      { key: 'messages', name: 'messages', params: undefined },
      { key: 'profile', name: 'profile', params: undefined },
    ],
    routeNames: ['sobriety', 'matches', 'connections', 'messages', 'profile'],
    history: [],
    type: 'tab',
    key: 'tab',
    stale: false,
  },
  navigation: {
    navigate: jest.fn(),
    emit: jest.fn(() => ({ defaultPrevented: false })),
  } as any,
  descriptors: {
    sobriety: { options: {} } as any,
    matches: { options: {} } as any,
    connections: { options: {} } as any,
    messages: { options: {} } as any,
    profile: { options: {} } as any,
  },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
});

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <PaperProvider>{component}</PaperProvider>
      </ThemeProvider>
    </Provider>
  );
};

describe('TabBar', () => {
  it('renders all 5 tabs with correct labels', () => {
    const props = createMockProps();
    const { getByText } = renderWithProviders(<TabBar {...props} />);

    expect(getByText('Sobriety')).toBeTruthy();
    expect(getByText('Matches')).toBeTruthy();
    expect(getByText('Connections')).toBeTruthy();
    expect(getByText('Messages')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('has proper accessibility labels on all tabs', () => {
    const props = createMockProps();
    const { getByLabelText } = renderWithProviders(<TabBar {...props} />);

    expect(getByLabelText('Sobriety tracking tab')).toBeTruthy();
    expect(getByLabelText('Match discovery tab')).toBeTruthy();
    expect(getByLabelText('Connections management tab')).toBeTruthy();
    expect(getByLabelText('Messages tab')).toBeTruthy();
    expect(getByLabelText('Profile settings tab')).toBeTruthy();
  });

  it('marks the active tab with selected state', () => {
    const props = createMockProps();
    const { getByLabelText } = renderWithProviders(<TabBar {...props} />);

    const sobrietyTab = getByLabelText('Sobriety tracking tab');
    expect(sobrietyTab.props.accessibilityState).toEqual({ selected: true });
  });

  it('shows notification badge on Messages tab when there are unread messages', () => {
    const store = createMockStore({
      messages: {
        conversations: [
          {
            id: '1',
            connection: { id: 'conn-1' } as any,
            lastMessage: { text: 'Hello' } as any,
            lastMessageAt: new Date().toISOString(),
            unreadCount: 3,
          },
        ],
      },
    });

    const props = createMockProps();
    const { getByText } = renderWithProviders(<TabBar {...props} />, store);

    expect(getByText('3')).toBeTruthy();
  });

  it('shows notification badge on Connections tab when there are pending requests', () => {
    const store = createMockStore({
      connections: {
        pendingRequests: [
          { id: 'req-1' } as any,
          { id: 'req-2' } as any,
        ],
      },
    });

    const props = createMockProps();
    const { getByText } = renderWithProviders(<TabBar {...props} />, store);

    expect(getByText('2')).toBeTruthy();
  });

  it('navigates to correct tab when pressed', () => {
    const props = createMockProps();
    const { getByLabelText } = renderWithProviders(<TabBar {...props} />);

    const matchesTab = getByLabelText('Match discovery tab');
    fireEvent.press(matchesTab);

    expect(props.navigation.navigate).toHaveBeenCalledWith('matches');
  });

  it('has minimum 44x44 touch targets', () => {
    const props = createMockProps();
    const { getByLabelText } = renderWithProviders(<TabBar {...props} />);

    const sobrietyTab = getByLabelText('Sobriety tracking tab');
    expect(sobrietyTab.props.style).toMatchObject({
      minHeight: 44,
      minWidth: 44,
    });
  });

  it('does not show badge when counts are zero', () => {
    const store = createMockStore({
      messages: { conversations: [] },
      connections: { pendingRequests: [] },
    });

    const props = createMockProps();
    const { queryByText } = renderWithProviders(<TabBar {...props} />, store);

    expect(queryByText('0')).toBeNull();
  });

  it('displays "99+" for counts over 99', () => {
    const store = createMockStore({
      messages: {
        conversations: Array.from({ length: 100 }, (_, i) => ({
          id: `conv-${i}`,
          connection: { id: `conn-${i}` } as any,
          lastMessage: { text: 'Message' } as any,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 1,
        })),
      },
    });

    const props = createMockProps();
    const { getByText } = renderWithProviders(<TabBar {...props} />, store);

    expect(getByText('99+')).toBeTruthy();
  });
});
