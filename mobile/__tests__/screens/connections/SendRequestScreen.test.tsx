import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import SendRequestScreen from '../../../src/screens/connections/SendRequestScreen';
import { connectionsApi } from '../../../src/store/api/connectionsApi';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: {
        sponsorId: 'sponsor-123',
        sponsorName: 'John Sponsor',
        sponsorPhotoUrl: 'https://example.com/photo.jpg',
      },
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

describe('SendRequestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sponsor information correctly', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText('John Sponsor')).toBeTruthy();
    expect(getByText('Send a connection request to start your sponsorship journey')).toBeTruthy();
  });

  it('allows typing message', () => {
    const store = createMockStore();

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const input = getByPlaceholderText(/Hi, I'm interested in working with you/);
    fireEvent.changeText(input, 'Hello, I would like to connect with you');

    expect(getByText(/35 \/ 200 characters/)).toBeTruthy();
  });

  it('shows error when exceeding character limit', () => {
    const store = createMockStore();

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const input = getByPlaceholderText(/Hi, I'm interested in working with you/);
    const longMessage = 'a'.repeat(210);
    fireEvent.changeText(input, longMessage);

    expect(getByText(/210 \/ 200 characters/)).toBeTruthy();
  });

  it('disables send button when message is too long', () => {
    const store = createMockStore();

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const input = getByPlaceholderText(/Hi, I'm interested in working with you/);
    const longMessage = 'a'.repeat(210);
    fireEvent.changeText(input, longMessage);

    const sendButton = getByText('Send Request');
    expect(sendButton.props.accessibilityState.disabled).toBe(true);
  });

  it('sends request with message', async () => {
    const mockSendRequest = jest.fn().mockResolvedValue({
      data: { id: 'request-1' },
    });

    jest.spyOn(connectionsApi.endpoints.sendRequest, 'useMutation').mockReturnValue([
      mockSendRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const input = getByPlaceholderText(/Hi, I'm interested in working with you/);
    fireEvent.changeText(input, 'Hello, I would like to connect');

    const sendButton = getByText('Send Request');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith({
        sponsor_id: 'sponsor-123',
        message: 'Hello, I would like to connect',
      });
    });
  });

  it('sends request without message (optional)', async () => {
    const mockSendRequest = jest.fn().mockResolvedValue({
      data: { id: 'request-1' },
    });

    jest.spyOn(connectionsApi.endpoints.sendRequest, 'useMutation').mockReturnValue([
      mockSendRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const sendButton = getByText('Send Request');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith({
        sponsor_id: 'sponsor-123',
        message: undefined,
      });
    });
  });

  it('shows success message and navigates back after sending', async () => {
    const mockSendRequest = jest.fn().mockResolvedValue({
      data: { id: 'request-1' },
    });

    jest.spyOn(connectionsApi.endpoints.sendRequest, 'useMutation').mockReturnValue([
      mockSendRequest,
      { isLoading: false },
    ] as any);

    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const sendButton = getByText('Send Request');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText(/Request sent to John Sponsor/)).toBeTruthy();
    });

    // Wait for navigation after delay
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('displays guidelines for what to include', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    expect(getByText(/What to Include:/)).toBeTruthy();
    expect(getByText(/Your sobriety goals/)).toBeTruthy();
    expect(getByText(/Your availability and commitment level/)).toBeTruthy();
  });

  it('shows cancel button that navigates back', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SendRequestScreen />
        </NavigationContainer>
      </Provider>
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
