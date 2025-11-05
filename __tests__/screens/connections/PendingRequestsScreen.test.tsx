import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import PendingRequestsScreen from '../../../src/screens/connections/PendingRequestsScreen';
import { connectionsApi } from '../../../src/store/api/connectionsApi';

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

const createMockStore = () => {
  return configureStore({
    reducer: {
      [connectionsApi.reducerPath]: connectionsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(connectionsApi.middleware),
  });
};

const mockPendingRequests = [
  {
    id: 'request-1',
    sponsee_id: 'sponsee-1',
    sponsor_id: 'sponsor-123',
    message: 'I would like to work with you on my recovery journey',
    status: 'pending' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    sponsee_name: 'John Doe',
    sponsee_photo_url: 'https://example.com/john.jpg',
  },
  {
    id: 'request-2',
    sponsee_id: 'sponsee-2',
    sponsor_id: 'sponsor-123',
    message: undefined,
    status: 'pending' as const,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    sponsee_name: 'Jane Smith',
    sponsee_photo_url: null,
  },
];

describe('PendingRequestsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('Loading requests...')).toBeTruthy();
  });

  it('renders pending requests correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('I would like to work with you on my recovery journey')).toBeTruthy();
  });

  it('shows empty state when no requests', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('No Pending Requests')).toBeTruthy();
    expect(getByText(/You don't have any pending connection requests/)).toBeTruthy();
  });

  it('accepts request successfully', async () => {
    const mockAcceptRequest = jest.fn().mockResolvedValue({
      data: { id: 'connection-1' },
    });

    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(connectionsApi.endpoints.acceptRequest, 'useMutation').mockReturnValue([
      mockAcceptRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getAllByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    const acceptButtons = getAllByText('Accept');
    fireEvent.press(acceptButtons[0]);

    await waitFor(() => {
      expect(mockAcceptRequest).toHaveBeenCalledWith({
        request_id: 'request-1',
      });
    });
  });

  it('shows decline dialog when decline button pressed', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getAllByText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    const declineButtons = getAllByText('Decline');
    fireEvent.press(declineButtons[0]);

    expect(getByText('Decline Request')).toBeTruthy();
    expect(getByText(/Are you sure you want to decline/)).toBeTruthy();
  });

  it('declines request with reason', async () => {
    const mockDeclineRequest = jest.fn().mockResolvedValue({ data: null });

    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(connectionsApi.endpoints.declineRequest, 'useMutation').mockReturnValue([
      mockDeclineRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getAllByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open decline dialog
    const declineButtons = getAllByText('Decline');
    fireEvent.press(declineButtons[0]);

    // Enter reason
    const reasonInput = getByPlaceholderText(/Optional: Provide a reason/);
    fireEvent.changeText(reasonInput, 'At capacity right now');

    // Confirm decline
    const confirmButton = getByText('Decline Request');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockDeclineRequest).toHaveBeenCalledWith({
        request_id: 'request-1',
        reason: 'At capacity right now',
      });
    });
  });

  it('declines request without reason', async () => {
    const mockDeclineRequest = jest.fn().mockResolvedValue({ data: null });

    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(connectionsApi.endpoints.declineRequest, 'useMutation').mockReturnValue([
      mockDeclineRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getAllByText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open decline dialog
    const declineButtons = getAllByText('Decline');
    fireEvent.press(declineButtons[0]);

    // Confirm decline without entering reason
    const confirmButton = getByText('Decline Request');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockDeclineRequest).toHaveBeenCalledWith({
        request_id: 'request-1',
        reason: undefined,
      });
    });
  });

  it('cancels decline dialog', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getAllByText, getByText, queryByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open decline dialog
    const declineButtons = getAllByText('Decline');
    fireEvent.press(declineButtons[0]);

    expect(getByText('Decline Request')).toBeTruthy();

    // Cancel dialog
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    // Dialog should be closed
    waitFor(() => {
      expect(queryByText('Decline Request')).toBeNull();
    });
  });

  it('enforces 300 character limit for decline reason', () => {
    jest.spyOn(connectionsApi.endpoints.getPendingRequests, 'useQuery').mockReturnValue({
      data: mockPendingRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getAllByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PendingRequestsScreen />
        </NavigationContainer>
      </Provider>
    );

    // Open decline dialog
    const declineButtons = getAllByText('Decline');
    fireEvent.press(declineButtons[0]);

    // Enter long reason
    const reasonInput = getByPlaceholderText(/Optional: Provide a reason/);
    const longReason = 'a'.repeat(350);
    fireEvent.changeText(reasonInput, longReason);

    // Check character counter shows over limit
    expect(getByText(/350 \/ 300 characters/)).toBeTruthy();
  });
});
