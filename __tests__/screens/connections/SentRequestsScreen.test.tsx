import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import SentRequestsScreen from '../../../src/screens/connections/SentRequestsScreen';
import { connectionsApi } from '../../../src/store/api/connectionsApi';

const createMockStore = () => {
  return configureStore({
    reducer: {
      [connectionsApi.reducerPath]: connectionsApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(connectionsApi.middleware),
  });
};

const mockSentRequests = [
  {
    id: 'request-1',
    sponsee_id: 'sponsee-123',
    sponsor_id: 'sponsor-1',
    message: 'I would like to work with you',
    status: 'pending' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    sponsor_name: 'John Sponsor',
    sponsor_photo_url: 'https://example.com/john.jpg',
  },
  {
    id: 'request-2',
    sponsee_id: 'sponsee-123',
    sponsor_id: 'sponsor-2',
    message: undefined,
    status: 'accepted' as const,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T12:00:00Z',
    sponsor_name: 'Jane Sponsor',
    sponsor_photo_url: null,
  },
  {
    id: 'request-3',
    sponsee_id: 'sponsee-123',
    sponsor_id: 'sponsor-3',
    message: 'Looking for guidance',
    status: 'declined' as const,
    declined_reason: 'At capacity right now',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T11:00:00Z',
    sponsor_name: 'Bob Sponsor',
    sponsor_photo_url: null,
  },
  {
    id: 'request-4',
    sponsee_id: 'sponsee-123',
    sponsor_id: 'sponsor-4',
    message: undefined,
    status: 'cancelled' as const,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:30:00Z',
    sponsor_name: 'Alice Sponsor',
    sponsor_photo_url: null,
  },
];

describe('SentRequestsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('Loading sent requests...')).toBeTruthy();
  });

  it('renders sent requests correctly', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: mockSentRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('John Sponsor')).toBeTruthy();
    expect(getByText('Jane Sponsor')).toBeTruthy();
    expect(getByText('Bob Sponsor')).toBeTruthy();
    expect(getByText('Alice Sponsor')).toBeTruthy();
  });

  it('shows empty state when no requests', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('No Sent Requests')).toBeTruthy();
    expect(getByText(/You haven't sent any connection requests yet/)).toBeTruthy();
  });

  it('displays correct status for pending request', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('pending')).toBeTruthy();
  });

  it('displays correct status for accepted request', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('accepted')).toBeTruthy();
  });

  it('displays correct status for declined request', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[2]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('declined')).toBeTruthy();
  });

  it('displays correct status for cancelled request', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[3]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('cancelled')).toBeTruthy();
  });

  it('shows declined reason when present', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[2]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText(/Reason: At capacity right now/)).toBeTruthy();
  });

  it('shows success message for accepted request', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText(/Request accepted! You are now connected/)).toBeTruthy();
  });

  it('shows cancel button only for pending requests', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: mockSentRequests,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { queryAllByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    // Only one pending request in mock data, so only one cancel button
    const cancelButtons = queryAllByText('Cancel Request');
    expect(cancelButtons).toHaveLength(1);
  });

  it('shows cancel confirmation dialog', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    const cancelButton = getByText('Cancel Request');
    fireEvent.press(cancelButton);

    expect(getByText('Cancel Request')).toBeTruthy();
    expect(getByText(/Are you sure you want to cancel/)).toBeTruthy();
  });

  it('cancels request successfully', async () => {
    const mockCancelRequest = jest.fn().mockResolvedValue({ data: null });

    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest
      .spyOn(connectionsApi.endpoints.cancelRequest, 'useMutation')
      .mockReturnValue([mockCancelRequest, { isLoading: false }] as any);

    const store = createMockStore();

    const { getAllByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    // Open cancel dialog
    const cancelButton = getAllByText('Cancel Request')[0];
    fireEvent.press(cancelButton);

    // Confirm cancel
    const confirmButton = getAllByText('Cancel Request')[1]; // Second one is in dialog
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockCancelRequest).toHaveBeenCalledWith('request-1');
    });
  });

  it('dismisses cancel dialog on back button', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getAllByText, getByText, queryByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    // Open cancel dialog
    const cancelButton = getByText('Cancel Request');
    fireEvent.press(cancelButton);

    expect(getByText(/Are you sure you want to cancel/)).toBeTruthy();

    // Dismiss dialog
    const backButton = getByText('No, Keep It');
    fireEvent.press(backButton);

    waitFor(() => {
      expect(queryByText(/Are you sure you want to cancel/)).toBeNull();
    });
  });

  it('displays message when present', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[0]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText(/I would like to work with you/)).toBeTruthy();
  });

  it('shows placeholder when no message', () => {
    jest.spyOn(connectionsApi.endpoints.getSentRequests, 'useQuery').mockReturnValue({
      data: [mockSentRequests[1]],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SentRequestsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('No message provided')).toBeTruthy();
  });
});
