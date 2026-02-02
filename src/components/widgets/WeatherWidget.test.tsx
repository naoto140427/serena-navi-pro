/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeatherWidget } from './WeatherWidget';
import { useNavStore } from '../../store/useNavStore';

// Setup Mock for global.fetch
const originalFetch = global.fetch;

describe('WeatherWidget Performance', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          current_weather: {
            temperature: 20,
            weathercode: 0,
            windspeed: 10,
            is_day: 1
          }
        })
      })
    ) as any;

    // Reset store state to default
    act(() => {
        useNavStore.setState({ currentLocation: { lat: 34.805, lng: 135.350 } });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('avoids excessive API calls on location updates', () => {
    render(<WeatherWidget />);

    // Expect initial fetch
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Simulate location update 1 (change Area Text to force re-render)
    act(() => {
      useNavStore.setState({
        currentLocation: { lat: 35.0, lng: 139.0 },
        currentAreaText: 'Area 1'
      });
    });

    // Simulate location update 2
    act(() => {
      useNavStore.setState({
        currentLocation: { lat: 36.0, lng: 140.0 },
        currentAreaText: 'Area 2'
      });
    });

    // If optimized, call count should remain 1.
    // If buggy (current state), call count will be 3.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
