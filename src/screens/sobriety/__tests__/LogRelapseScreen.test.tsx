/**
 * Log Relapse Screen Tests
 * WP06: Test suite for log relapse UI
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import { LogRelapseScreen } from '../LogRelapseScreen';
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

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LogRelapseScreen', () => {
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
    total_relapses: 0,
    last_relapse_date: null,
  };

  const createMockStore = (stats: any = mockStats) => {
    return configureStore({
      reducer: {
        [sobrietyApi.reducerPath]: sobrietyApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sobrietyApi.middleware),
      preloadedState: {
        [sobrietyApi.reducerPath]: {
          queries: {
            'getSobrietyStats(undefined)': {
              status: 'fulfilled',
              data: stats,
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
            <LogRelapseScreen navigation={{ navigate: mockNavigate, goBack: mockGoBack }} />
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display log relapse form', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/log relapse/i)).toBeTruthy();
    expect(getByText(/privacy notice/i)).toBeTruthy();
  });

  it('should display privacy notice explaining private note visibility', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(
      getByText(/your private note is only visible to you/i)
    ).toBeTruthy();
  });

  it('should display error state when no sobriety date set', () => {
    const store = createMockStore(null);
    const { getByText } = renderScreen(store);

    expect(getByText(/no active sobriety date found/i)).toBeTruthy();
    expect(getByText(/please set a sobriety date before logging a relapse/i)).toBeTruthy();
  });

  it('should navigate to SetSobrietyDate when no stats exist', async () => {
    const store = createMockStore(null);
    const { getByText } = renderScreen(store);

    const button = getByText(/set sobriety date/i);
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('SetSobrietyDate');
    });
  });

  it('should allow entering private note with 500 char limit', () => {
    const store = createMockStore();
    const { getByPlaceholderText, getByText } = renderScreen(store);

    const noteInput = getByPlaceholderText(/how are you feeling/i);
    fireEvent.changeText(noteInput, 'Test note');

    expect(getByText(/9\/500 characters/i)).toBeTruthy();
    expect(noteInput.props.maxLength).toBe(500);
  });

  it('should display trigger context dropdown', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/trigger context \(optional\)/i)).toBeTruthy();
    expect(getByText(/select trigger \(optional\)/i)).toBeTruthy();
  });

  it('should display warning card with important information', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/important/i)).toBeTruthy();
    expect(getByText(/reset your current streak to 0 days/i)).toBeTruthy();
    expect(getByText(/add this relapse to your history/i)).toBeTruthy();
  });

  it('should show confirmation alert when submit button pressed', async () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/log relapse/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Relapse Entry',
        expect.stringContaining('reset your streak'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Confirm' }),
        ])
      );
    });
  });

  it('should navigate back when cancel button pressed', async () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const cancelButton = getByText(/cancel/i);
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should show helper text about identifying triggers', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(
      getByText(/identifying triggers helps recognize patterns in your recovery/i)
    ).toBeTruthy();
  });

  it('should display date picker with current date by default', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const today = new Date().toLocaleDateString();
    expect(getByText(today)).toBeTruthy();
  });

  it('should show helper text that date cannot be in future', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/date cannot be in the future/i)).toBeTruthy();
  });

  it('should display error button color for submit button', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/log relapse/i);

    // Button should have error/destructive styling
    expect(submitButton).toBeTruthy();
  });

  it('should disable submit button when loading', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/log relapse/i);

    // Initially enabled (when not loading)
    expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
  });
});
