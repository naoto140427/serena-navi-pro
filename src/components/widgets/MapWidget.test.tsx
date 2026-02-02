// @vitest-environment jsdom
import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapWidget } from './MapWidget';
import { useNavStore } from '../../store/useNavStore';
import type { Waypoint } from '../../types';

// Mock react-map-gl
vi.mock('react-map-gl', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavigationControl: () => <div>NavControl</div>,
  Source: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Layer: () => <div>Layer</div>,
}));

// Mock Firebase dependencies used by the store
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  update: vi.fn(),
}));

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('MapWidget Performance', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      json: async () => ({ routes: [] }),
    });

    // Reset store state
    useNavStore.setState({
      currentLocation: { lat: 34.0, lng: 135.0 },
      nextWaypoint: { id: 'test', name: 'Test', coords: { lat: 34.1, lng: 135.1 }, type: 'parking' } as Waypoint,
    });
  });

  it('optimizes fetchRoute calls based on distance', async () => {
    render(<MapWidget />);

    // Initial fetch
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Simulate small location updates (should be skipped)
    // 0.00001 deg lat is approx 1.1m. Total move ~5.5m. Threshold is 50m.
    for (let i = 1; i <= 5; i++) {
        act(() => {
            useNavStore.setState({
                currentLocation: { lat: 34.0 + (i * 0.00001), lng: 135.0 }
            });
        });
    }

    // Should still be 1 call
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Simulate large move (> 50m)
    // 0.001 deg lat is approx 111m.
    act(() => {
        useNavStore.setState({
            currentLocation: { lat: 34.0 + 0.001, lng: 135.0 }
        });
    });

    // Should trigger a new fetch
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Update waypoint (should trigger fetch)
    act(() => {
        useNavStore.setState({
            nextWaypoint: { id: 'next', name: 'Next', coords: { lat: 35.0, lng: 136.0 }, type: 'parking' } as Waypoint
        });
    });

    // Should trigger a new fetch
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
