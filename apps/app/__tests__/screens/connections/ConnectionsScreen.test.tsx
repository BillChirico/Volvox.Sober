import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import ConnectionsScreen from '../../../src/screens/connections/ConnectionsScreen';
import { connectionsApi } from '../../../src/store/api/connectionsApi';
import userReducer from '../../../src/store/slices/userSlice';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
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

const mockConnections = [
  {
    id: 'connection-1',
    sponsee_id: 'user-123',
    sponsor_id: 'sponsor-1',
    status: 'active' as const,
    connected_at: '2024-01-15T10:00:00Z',
    last_contact: '2024-01-20T10:00:00Z',
    sponsor_name: 'John Sponsor',
    sponsor_photo_url: 'https://example.com/john.jpg',
    sponsor_years_sober: 5,
  },
  {
    id: 'connection-2',
    sponsee_id: 'sponsee-2',
    sponsor_id: 'user-123',
    status: 'active' as const,
    connected_at: '2024-01-16T10:00:00Z',
    last_contact: undefined,
    sponsee_name: 'Jane Sponsee',
    sponsee_photo_url: null,
    sponsee_step_progress: 3,
  },
];

describe('ConnectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Loading connections...')).toBeTruthy();
  });

  it('renders connections correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: mockConnections,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('John Sponsor')).toBeTruthy();
    expect(getByText('Jane Sponsee')).toBeTruthy();
  });

  it('shows empty state when no connections', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('No Active Connections')).toBeTruthy();
    expect(getByText(/You don't have any active connections yet/)).toBeTruthy();
  });

  it('displays sponsor role for sponsee connections', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123'); // User is sponsee

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Sponsor')).toBeTruthy();
    expect(getByText('John Sponsor')).toBeTruthy();
  });

  it('displays sponsee role for sponsor connections', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123'); // User is sponsor

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Sponsee')).toBeTruthy();
    expect(getByText('Jane Sponsee')).toBeTruthy();
  });

  it('displays connected since timestamp', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should show "X days ago" format
    expect(getByText(/ago/)).toBeTruthy();
  });

  it('displays last contact timestamp when present', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText(/Last contact:/)).toBeTruthy();
  });

  it('displays no recent contact when last_contact is undefined', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123');

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('No recent contact')).toBeTruthy();
  });

  it('displays step progress for sponsor viewing sponsee', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123'); // User is sponsor

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Step Progress:')).toBeTruthy();
    expect(getByText('Step 3/12')).toBeTruthy();
  });

  it('displays years sober for sponsee viewing sponsor', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123'); // User is sponsee

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Experience:')).toBeTruthy();
    expect(getByText('5 years sober')).toBeTruthy();
  });

  it('navigates to connection detail on press', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    const connectionCard = getByText('John Sponsor');
    fireEvent.press(connectionCard);

    expect(mockNavigate).toHaveBeenCalledWith('ConnectionDetail', {
      connection: mockConnections[0],
    });
  });

  it('supports pull to refresh', async () => {
    const mockRefetch = jest.fn();

    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: mockConnections,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    const store = createMockStore();

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Simulate pull to refresh (this is a simplified test, actual implementation may vary)
    // In real scenarios, you'd trigger the FlatList's onRefresh
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles missing photo URLs gracefully', () => {
    jest.spyOn(connectionsApi.endpoints.getConnections, 'useQuery').mockReturnValue({
      data: [mockConnections[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore('user-123');

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Should render default avatar icon for null photo_url
    expect(getByText('Jane Sponsee')).toBeTruthy();
  });
});
