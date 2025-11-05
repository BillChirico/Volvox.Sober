import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MatchCard from '../../../src/components/matches/MatchCard';
import { Match } from '../../../src/store/api/matchingApi';

// Mock store
const mockStore = configureStore({
  reducer: {
    // Add minimal required reducers
  },
});

const mockMatch: Match = {
  sponsor_id: 'sponsor-123',
  sponsor_name: 'John Doe',
  sponsor_photo_url: 'https://example.com/photo.jpg',
  compatibility_score: 85,
  location: {
    city: 'San Francisco',
    state: 'CA',
  },
  years_sober: 5,
  availability: 'Daily',
  approach: 'Systematic step-by-step approach with compassion',
  bio: 'I have been in recovery for 5 years and love helping others.',
  score_breakdown: {
    location: 25,
    program_type: 25,
    availability: 20,
    approach: 10,
    experience: 15,
  },
};

describe('MatchCard', () => {
  it('renders match information correctly', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('San Francisco, CA')).toBeTruthy();
    expect(getByText('5 years sober')).toBeTruthy();
    expect(getByText('85')).toBeTruthy();
  });

  it('displays compatibility score with correct color for excellent match', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    const scoreText = getByText('85');
    expect(scoreText).toBeTruthy();
    // Score >= 80 should have green color
  });

  it('displays compatibility score with correct color for good match', () => {
    const goodMatch = { ...mockMatch, compatibility_score: 70 };
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={goodMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    const scoreText = getByText('70');
    expect(scoreText).toBeTruthy();
    // Score 60-79 should have amber color
  });

  it('displays compatibility score with correct color for potential match', () => {
    const potentialMatch = { ...mockMatch, compatibility_score: 50 };
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={potentialMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    const scoreText = getByText('50');
    expect(scoreText).toBeTruthy();
    // Score < 60 should have orange color
  });

  it('displays compatibility breakdown correctly', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    expect(getByText('Location')).toBeTruthy();
    expect(getByText('25/25')).toBeTruthy();
    expect(getByText('Program Type')).toBeTruthy();
    expect(getByText('25/25')).toBeTruthy();
    expect(getByText('Availability')).toBeTruthy();
    expect(getByText('20/20')).toBeTruthy();
    expect(getByText('Approach')).toBeTruthy();
    expect(getByText('10/15')).toBeTruthy();
    expect(getByText('Experience')).toBeTruthy();
    expect(getByText('15/15')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByA11yLabel } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    const card = getByA11yLabel('Match with John Doe');
    fireEvent.press(card);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onConnect when connect button is pressed', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    const connectButton = getByText('Send Connection Request');
    fireEvent.press(connectButton);

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('renders without photo when photo_url is not provided', () => {
    const matchWithoutPhoto = { ...mockMatch, sponsor_photo_url: undefined };
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { queryByTestId } = render(
      <Provider store={mockStore}>
        <MatchCard match={matchWithoutPhoto} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    // Should render default avatar icon instead of image
    expect(queryByTestId('avatar-image')).toBeNull();
  });

  it('displays correct compatibility label for excellent match', () => {
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={mockMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    expect(getByText('Excellent Match')).toBeTruthy();
  });

  it('displays correct compatibility label for good match', () => {
    const goodMatch = { ...mockMatch, compatibility_score: 70 };
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={goodMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    expect(getByText('Good Match')).toBeTruthy();
  });

  it('displays correct compatibility label for potential match', () => {
    const potentialMatch = { ...mockMatch, compatibility_score: 50 };
    const onPress = jest.fn();
    const onConnect = jest.fn();

    const { getByText } = render(
      <Provider store={mockStore}>
        <MatchCard match={potentialMatch} onPress={onPress} onConnect={onConnect} />
      </Provider>,
    );

    expect(getByText('Potential Match')).toBeTruthy();
  });
});
