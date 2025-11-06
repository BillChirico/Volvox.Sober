import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import BrowseMatchesScreen from '../../../src/screens/matches/BrowseMatchesScreen';
import { matchingApi } from '../../../src/store/api/matchingApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

const mockMatches = {
  matches: [
    {
      sponsor_id: 'sponsor-1',
      sponsor_name: 'John Doe',
      compatibility_score: 85,
      location: { city: 'San Francisco', state: 'CA' },
      years_sober: 5,
      availability: 'Daily',
      approach: 'Systematic approach',
      score_breakdown: {
        location: 25,
        program_type: 25,
        availability: 20,
        approach: 10,
        experience: 15,
      },
    },
    {
      sponsor_id: 'sponsor-2',
      sponsor_name: 'Jane Smith',
      compatibility_score: 75,
      location: { city: 'Oakland', state: 'CA' },
      years_sober: 3,
      availability: '3-5 days',
      approach: 'Compassionate approach',
      score_breakdown: {
        location: 15,
        program_type: 25,
        availability: 20,
        approach: 12,
        experience: 13,
      },
    },
  ],
  execution_time_ms: 1200,
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: () => ({ user: { id: 'user-123' } }),
      [matchingApi.reducerPath]: matchingApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(matchingApi.middleware),
    preloadedState: initialState,
  });
};

describe('BrowseMatchesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(jest.fn());
  });

  it('renders loading skeleton when fetching matches', () => {
    const store = createMockStore();

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByText('Finding your matches...')).toBeTruthy();
  });

  it('renders empty state when no matches found', async () => {
    const store = createMockStore();

    // Mock empty matches response
    jest.spyOn(matchingApi.endpoints.getMatches, 'useQuery').mockReturnValue({
      data: { matches: [], execution_time_ms: 500 },
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('No Matches Found')).toBeTruthy();
      expect(
        getByText("We couldn't find any sponsors that match your preferences right now."),
      ).toBeTruthy();
    });
  });

  it('displays offline banner when offline with cached matches', async () => {
    const store = createMockStore();

    // Mock offline state
    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      callback({ isConnected: false });
      return jest.fn();
    });

    // Mock cached matches
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        matches: mockMatches.matches,
        cached_at: new Date().toISOString(),
      }),
    );

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText(/Offline - Showing cached matches/)).toBeTruthy();
    });
  });

  it('caches matches when data is fetched', async () => {
    const store = createMockStore();

    jest.spyOn(matchingApi.endpoints.getMatches, 'useQuery').mockReturnValue({
      data: mockMatches,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'matches:user-123',
        expect.stringContaining('sponsor-1'),
      );
    });
  });

  it('calls refetch when pull-to-refresh is triggered', async () => {
    const mockRefetch = jest.fn();
    const store = createMockStore();

    jest.spyOn(matchingApi.endpoints.getMatches, 'useQuery').mockReturnValue({
      data: mockMatches,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    // Simulate pull-to-refresh
    const flatList = getByTestId('matches-list');
    fireEvent(flatList, 'refresh');

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('navigates to match detail when match card is pressed', async () => {
    const mockNavigate = jest.fn();
    const store = createMockStore();

    jest.spyOn(matchingApi.endpoints.getMatches, 'useQuery').mockReturnValue({
      data: mockMatches,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByA11yLabel } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      const matchCard = getByA11yLabel('Match with John Doe');
      fireEvent.press(matchCard);

      expect(mockNavigate).toHaveBeenCalledWith('MatchDetail', {
        match: mockMatches.matches[0],
      });
    });
  });

  it('navigates to connection request when connect button is pressed', async () => {
    const mockNavigate = jest.fn();
    const store = createMockStore();

    jest.spyOn(matchingApi.endpoints.getMatches, 'useQuery').mockReturnValue({
      data: mockMatches,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as any);

    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      const connectButton = getByText('Send Connection Request');
      fireEvent.press(connectButton);

      expect(mockNavigate).toHaveBeenCalledWith('ConnectionRequest', {
        sponsorId: 'sponsor-1',
      });
    });
  });

  it('loads cached matches on mount', async () => {
    const store = createMockStore();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        matches: mockMatches.matches,
        cached_at: new Date().toISOString(),
      }),
    );

    render(
      <Provider store={store}>
        <NavigationContainer>
          <BrowseMatchesScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('matches:user-123');
    });
  });
});
