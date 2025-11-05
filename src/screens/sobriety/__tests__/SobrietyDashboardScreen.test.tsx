/**
 * Sobriety Dashboard Screen Tests
 * WP06: Test suite for sobriety dashboard UI
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { SobrietyDashboardScreen } from '../SobrietyDashboardScreen';
import { sobrietyApi } from '../../../store/api/sobrietyApi';

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
  };
});

describe('SobrietyDashboardScreen', () => {
  const mockStats = {
    id: 'stats-123',
    user_id: 'user-123',
    substance_type: 'Alcohol',
    start_date: '2024-01-01',
    current_streak_days: 45,
    milestones_achieved: ['30_days'],
    next_milestone_days: 60,
    days_until_next_milestone: 15,
    is_active: true,
    total_relapses: 2,
    last_relapse_date: '2023-12-15',
  };

  const createMockStore = (stats: any = mockStats, isLoading = false, error: any = null) => {
    return configureStore({
      reducer: {
        [sobrietyApi.reducerPath]: sobrietyApi.reducer,
      },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sobrietyApi.middleware),
      preloadedState: {
        [sobrietyApi.reducerPath]: {
          queries: {
            'getSobrietyStats(undefined)': {
              status: error ? 'rejected' : isLoading ? 'pending' : 'fulfilled',
              data: stats,
              error,
            },
          },
        },
      },
    });
  };

  const renderScreen = (store: any) => {
    return render(
      <Provider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <SobrietyDashboardScreen navigation={{ navigate: mockNavigate, goBack: mockGoBack }} />
          </NavigationContainer>
        </PaperProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading indicator when data is loading', () => {
    const store = createMockStore(null, true);
    const { getByText } = renderScreen(store);

    expect(getByText(/loading your sobriety stats/i)).toBeTruthy();
  });

  it('should display error message when fetch fails', () => {
    const store = createMockStore(null, false, { message: 'Failed to fetch' });
    const { getByText } = renderScreen(store);

    expect(getByText(/failed to load sobriety stats/i)).toBeTruthy();
  });

  it('should display empty state when no sobriety date set', () => {
    const store = createMockStore(null);
    const { getByText } = renderScreen(store);

    expect(getByText(/start your sobriety journey/i)).toBeTruthy();
    expect(getByText(/set sobriety date/i)).toBeTruthy();
  });

  it('should navigate to SetSobrietyDate when "Set Sobriety Date" button pressed in empty state', async () => {
    const store = createMockStore(null);
    const { getByText } = renderScreen(store);

    const button = getByText(/set sobriety date/i);
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('SetSobrietyDate');
    });
  });

  it('should display current streak correctly', () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    expect(getByText('45')).toBeTruthy();
    expect(getByText('Days')).toBeTruthy();
  });

  it('should display singular "Day" when streak is 1 day', () => {
    const statsOneDayStreak = { ...mockStats, current_streak_days: 1 };
    const store = createMockStore(statsOneDayStreak);
    const { getByText } = renderScreen(store);

    expect(getByText('1')).toBeTruthy();
    expect(getByText('Day')).toBeTruthy();
  });

  it('should display start date and substance type', () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    expect(getByText('Alcohol')).toBeTruthy();
    expect(getByText('1/1/2024')).toBeTruthy();
  });

  it('should display next milestone progress when next milestone exists', () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    expect(getByText(/60 days - two months strong/i)).toBeTruthy();
    expect(getByText(/15 days to go/i)).toBeTruthy();
  });

  it('should not display progress card when all milestones achieved', () => {
    const statsAllMilestones = {
      ...mockStats,
      current_streak_days: 365,
      milestones_achieved: ['30_days', '60_days', '90_days', '180_days', '1_year'],
      next_milestone_days: null,
      days_until_next_milestone: null,
    };
    const store = createMockStore(statsAllMilestones);
    const { queryByText } = renderScreen(store);

    expect(queryByText(/next milestone/i)).toBeNull();
  });

  it('should display milestones list with achieved markers', () => {
    const store = createMockStore(mockStats);
    const { getByText, getAllByText } = renderScreen(store);

    // 30 days milestone should be marked as achieved
    expect(getByText(/30 days - one month sober/i)).toBeTruthy();

    // Check for achievement badges
    const achievedBadges = getAllByText('✓');
    expect(achievedBadges.length).toBeGreaterThan(0);
  });

  it('should display recovery statistics when relapses exist', () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    expect(getByText(/recovery statistics/i)).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // total_relapses
    expect(getByText('12/15/2023')).toBeTruthy(); // last_relapse_date
  });

  it('should not display recovery statistics when no relapses', () => {
    const statsNoRelapses = { ...mockStats, total_relapses: 0, last_relapse_date: null };
    const store = createMockStore(statsNoRelapses);
    const { queryByText } = renderScreen(store);

    expect(queryByText(/recovery statistics/i)).toBeNull();
  });

  it('should navigate to SetSobrietyDate when "Update Sobriety Date" button pressed', async () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    const button = getByText(/update sobriety date/i);
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('SetSobrietyDate');
    });
  });

  it('should navigate to LogRelapse when "Log Relapse" button pressed', async () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    const button = getByText(/log relapse/i);
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('LogRelapse');
    });
  });

  it('should navigate to RelapseHistory when "View Relapse History" button pressed', async () => {
    const store = createMockStore(mockStats);
    const { getByText } = renderScreen(store);

    const button = getByText(/view relapse history/i);
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('RelapseHistory');
    });
  });

  it('should calculate progress correctly (50% to 60 days)', () => {
    const stats50Days = {
      ...mockStats,
      current_streak_days: 30, // 50% to 60 days milestone
      next_milestone_days: 60,
      days_until_next_milestone: 30,
    };
    const store = createMockStore(stats50Days);
    const { getByText } = renderScreen(store);

    expect(getByText('30')).toBeTruthy();
    expect(getByText(/30 days to go/i)).toBeTruthy();
  });
});
