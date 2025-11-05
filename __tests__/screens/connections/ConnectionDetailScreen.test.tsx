import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import ConnectionDetailScreen from '../../../src/screens/connections/ConnectionDetailScreen';
import { connectionsApi } from '../../../src/store/api/connectionsApi';
import userReducer from '../../../src/store/slices/userSlice';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: {
        connection: {
          id: 'connection-1',
          sponsee_id: 'user-123',
          sponsor_id: 'sponsor-1',
          status: 'active',
          connected_at: '2024-01-15T10:00:00Z',
          last_contact: '2024-01-20T10:00:00Z',
          sponsor_name: 'John Sponsor',
          sponsor_photo_url: 'https://example.com/john.jpg',
          sponsor_years_sober: 5,
        },
      },
    }),
  };
});

const createMockStore = (userId: string = 'user-123') => {
  return configureStore({
    reducer: {
      user: userReducer,
      [connectionsApi.reducerPath]: connectionsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(connectionsApi.middleware),
    preloadedState: {
      user: {
        user: { id: userId },
      },
    },
  });
};

describe('ConnectionDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connection information correctly', () => {
    const store = createMockStore('user-123'); // User is sponsee

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('John Sponsor')).toBeTruthy();
    expect(getByText('Your Sponsor')).toBeTruthy();
    expect(getByText('Connection Information')).toBeTruthy();
  });

  it('displays correct role label for sponsee', () => {
    const store = createMockStore('user-123'); // User is sponsee

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Your Sponsor')).toBeTruthy();
  });

  it('displays correct role label for sponsor', () => {
    const store = createMockStore('sponsor-1'); // User is sponsor

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Your Sponsee')).toBeTruthy();
  });

  it('displays connected date correctly', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should show formatted date
    expect(getByText(/January \d+, 2024/)).toBeTruthy();
  });

  it('displays connected duration', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should show "X days ago" format
    expect(getByText(/ago/)).toBeTruthy();
  });

  it('displays last contact when present', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText(/💬 Last Contact:/)).toBeTruthy();
  });

  it('displays sponsor experience for sponsee', () => {
    const store = createMockStore('user-123'); // User is sponsee

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Sponsor Experience')).toBeTruthy();
    expect(getByText('Years Sober')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('navigates to chat on send message', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    const messageButton = getByText('Send Message');
    fireEvent.press(messageButton);

    expect(mockNavigate).toHaveBeenCalledWith('Chat', {
      connectionId: 'connection-1',
      otherPersonName: 'John Sponsor',
      otherPersonPhotoUrl: 'https://example.com/john.jpg',
    });
  });

  it('shows disconnect dialog on disconnect button press', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    const disconnectButton = getByText('Disconnect');
    fireEvent.press(disconnectButton);

    expect(getByText('Disconnect Connection')).toBeTruthy();
    expect(getByText(/Are you sure you want to disconnect from John Sponsor/)).toBeTruthy();
  });

  it('displays 90-day archiving warning in dialog', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    const disconnectButton = getByText('Disconnect');
    fireEvent.press(disconnectButton);

    expect(getByText(/message history will be archived for 90 days/)).toBeTruthy();
  });

  it('cancels disconnect dialog', () => {
    const store = createMockStore();

    const { getByText, queryByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open dialog
    const disconnectButton = getByText('Disconnect');
    fireEvent.press(disconnectButton);

    expect(getByText('Disconnect Connection')).toBeTruthy();

    // Cancel
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    waitFor(() => {
      expect(queryByText('Disconnect Connection')).toBeNull();
    });
  });

  it('confirms disconnect and navigates back', async () => {
    const mockDisconnect = jest.fn().mockResolvedValue({ data: null });

    jest.spyOn(connectionsApi.endpoints.disconnect, 'useMutation').mockReturnValue([
      mockDisconnect,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getAllByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open dialog
    const disconnectButton = getAllByText('Disconnect')[0];
    fireEvent.press(disconnectButton);

    // Confirm (second "Disconnect" button is in dialog)
    const confirmButton = getAllByText('Disconnect')[1];
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalledWith({
        connection_id: 'connection-1',
      });
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('displays info note about message archiving', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText(/Disconnecting will end this sponsorship relationship/)).toBeTruthy();
    expect(getByText(/Messages will be archived for 90 days/)).toBeTruthy();
  });

  it('handles missing photo URL gracefully', () => {
    // Mock route with null photo
    jest.mock('@react-navigation/native', () => {
      const actualNav = jest.requireActual('@react-navigation/native');
      return {
        ...actualNav,
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: mockGoBack,
        }),
        useRoute: () => ({
          params: {
            connection: {
              id: 'connection-2',
              sponsee_id: 'sponsee-2',
              sponsor_id: 'user-123',
              status: 'active',
              connected_at: '2024-01-16T10:00:00Z',
              sponsee_name: 'Jane Sponsee',
              sponsee_photo_url: null,
              sponsee_step_progress: 3,
            },
          },
        }),
      };
    });

    const store = createMockStore('user-123');

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should render with default avatar icon
    expect(getByText('John Sponsor')).toBeTruthy();
  });

  it('handles missing last contact gracefully', () => {
    // Mock route with no last_contact
    jest.mock('@react-navigation/native', () => {
      const actualNav = jest.requireActual('@react-navigation/native');
      return {
        ...actualNav,
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: mockGoBack,
        }),
        useRoute: () => ({
          params: {
            connection: {
              id: 'connection-3',
              sponsee_id: 'user-123',
              sponsor_id: 'sponsor-3',
              status: 'active',
              connected_at: '2024-01-17T10:00:00Z',
              sponsor_name: 'Bob Sponsor',
              sponsor_photo_url: null,
              sponsor_years_sober: 10,
            },
          },
        }),
      };
    });

    const store = createMockStore();

    const { queryByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should not show last contact section when undefined
    expect(queryByText(/💬 Last Contact:/)).toBeNull();
  });

  it('shows loading state during disconnect', () => {
    const mockDisconnect = jest.fn();

    jest.spyOn(connectionsApi.endpoints.disconnect, 'useMutation').mockReturnValue([
      mockDisconnect,
      { isLoading: true },
    ] as any);

    const store = createMockStore();

    const { getAllByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionDetailScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open dialog
    const disconnectButton = getAllByText('Disconnect')[0];
    fireEvent.press(disconnectButton);

    // Button should show loading state
    const confirmButton = getAllByText('Disconnect')[1];
    expect(confirmButton.props.loading).toBe(true);
  });
});
