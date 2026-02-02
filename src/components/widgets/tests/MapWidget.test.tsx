import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MapWidget } from '../MapWidget';
import { useNavStore } from '../../../store/useNavStore';

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Source: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Layer: () => <div />,
  NavigationControl: () => <div />,
}));

// Mock useNavStore
vi.mock('../../../store/useNavStore', () => ({
  useNavStore: vi.fn(),
}));

describe('MapWidget Performance', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        routes: [{ geometry: { coordinates: [] } }]
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throttles API calls based on distance threshold', async () => {
    // Initial state
    const initialState = {
      currentLocation: { lat: 35.0, lng: 135.0 },
      nextWaypoint: { id: 'wp1', coords: { lat: 36.0, lng: 136.0 }, name: 'WP1' }
    };

    (useNavStore as any).mockReturnValue(initialState);

    let rerender: any;

    await act(async () => {
      const result = render(<MapWidget />);
      rerender = result.rerender;
      // Allow effect to complete (fetch + state update + ref update)
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Initial fetch
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Update location slightly (0.0001 deg is approx 11 meters, < 50m)
    const state2 = {
      ...initialState,
      currentLocation: { lat: 35.0001, lng: 135.0001 }
    };
    (useNavStore as any).mockReturnValue(state2);

    await act(async () => {
      rerender(<MapWidget />);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should NOT fetch again
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Update location slightly again
    const state3 = {
      ...state2,
      currentLocation: { lat: 35.0002, lng: 135.0002 }
    };
    (useNavStore as any).mockReturnValue(state3);

    await act(async () => {
      rerender(<MapWidget />);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should still be 1 call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Now move significantly (> 50m). 0.001 deg is approx 111 meters.
    const state4 = {
      ...state3,
      currentLocation: { lat: 35.001, lng: 135.001 }
    };
    (useNavStore as any).mockReturnValue(state4);

    await act(async () => {
      rerender(<MapWidget />);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should fetch now
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
