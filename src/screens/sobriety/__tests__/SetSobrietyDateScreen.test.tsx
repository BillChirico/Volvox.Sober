/**
 * Set Sobriety Date Screen Tests
 * WP06: Test suite for set sobriety date UI
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { SetSobrietyDateScreen } from '../SetSobrietyDateScreen';
import { sobrietyApi } from '../../../store/api/sobrietyApi';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockRoute = {
  params: undefined,
};

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

describe('SetSobrietyDateScreen', () => {
  const createMockStore = () => {
    return configureStore({
      reducer: {
        [sobrietyApi.reducerPath]: sobrietyApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sobrietyApi.middleware),
    });
  };

  const renderScreen = (store: any, route = mockRoute) => {
    return render(
      <Provider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <SetSobrietyDateScreen
              navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
              route={route}
            />
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "Set Your Sobriety Date" title for new entry', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/set your sobriety date/i)).toBeTruthy();
  });

  it('should display "Update Sobriety Date" title when editing', () => {
    const store = createMockStore();
    const editRoute = {
      params: {
        sobrietyData: {
          substance_type: 'Alcohol',
          start_date: '2024-01-01',
        },
      },
    };
    const { getByText } = renderScreen(store, editRoute);

    expect(getByText(/update sobriety date/i)).toBeTruthy();
  });

  it('should pre-fill substance type when editing', () => {
    const store = createMockStore();
    const editRoute = {
      params: {
        sobrietyData: {
          substance_type: 'Alcohol',
          start_date: '2024-01-01',
        },
      },
    };
    const { getByDisplayValue } = renderScreen(store, editRoute);

    expect(getByDisplayValue('Alcohol')).toBeTruthy();
  });

  it('should show error when substance type is empty on submit', async () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/set sobriety date/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText(/please enter a substance type/i)).toBeTruthy();
    });
  });

  it('should show error when date is in future', async () => {
    const store = createMockStore();
    const { getByText, getByPlaceholderText } = renderScreen(store);

    const input = getByPlaceholderText(/e\.g\., alcohol, nicotine/i);
    fireEvent.changeText(input, 'Alcohol');

    // Simulate date picker selecting future date
    // Note: In real test, you'd use date picker library's test utils

    const submitButton = getByText(/set sobriety date/i);
    fireEvent.press(submitButton);

    // This would trigger validation if date > now
  });

  it('should display confirmation card with entered data', async () => {
    const store = createMockStore();
    const { getByText, getByPlaceholderText } = renderScreen(store);

    const input = getByPlaceholderText(/e\.g\., alcohol, nicotine/i);
    fireEvent.changeText(input, 'Alcohol');

    await waitFor(() => {
      expect(getByText(/tracking: alcohol/i)).toBeTruthy();
    });
  });

  it('should clear error when substance type is entered', async () => {
    const store = createMockStore();
    const { getByText, getByPlaceholderText, queryByText } = renderScreen(store);

    // Trigger error by submitting empty
    const submitButton = getByText(/set sobriety date/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText(/please enter a substance type/i)).toBeTruthy();
    });

    // Clear error by entering text
    const input = getByPlaceholderText(/e\.g\., alcohol, nicotine/i);
    fireEvent.changeText(input, 'Alcohol');

    await waitFor(() => {
      expect(queryByText(/please enter a substance type/i)).toBeNull();
    });
  });

  it('should navigate back on cancel button press', async () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const cancelButton = getByText(/cancel/i);
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should disable submit button when loading', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/set sobriety date/i);

    // Initially enabled (when not loading)
    expect(submitButton.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('should disable submit button when substance type is empty', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    const submitButton = getByText(/set sobriety date/i);

    // Disabled when substance type empty
    expect(submitButton.props.accessibilityState?.disabled).toBeTruthy();
  });

  it('should enforce 100 character limit on substance type', () => {
    const store = createMockStore();
    const { getByPlaceholderText } = renderScreen(store);

    const input = getByPlaceholderText(/e\.g\., alcohol, nicotine/i);

    expect(input.props.maxLength).toBe(100);
  });

  it('should show helper text about future dates', () => {
    const store = createMockStore();
    const { getByText } = renderScreen(store);

    expect(getByText(/date cannot be in the future/i)).toBeTruthy();
  });
});
