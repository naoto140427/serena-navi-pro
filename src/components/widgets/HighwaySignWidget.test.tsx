// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { HighwaySignWidget } from './HighwaySignWidget';
import { useNavStore } from '../../store/useNavStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(() => ({ key: 'mock-key' })),
  update: vi.fn(),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('HighwaySignWidget Performance', () => {
  beforeEach(() => {
    useNavStore.setState({
      nextWaypoint: {
        id: 'awaji_sa',
        name: 'Awaji SA',
        coords: { lat: 0, lng: 0 },
        type: 'parking',
        description: '',
        image: '',
        quests: [],
        specs: {},
        weather: { type: 'sunny', temp: '' },
        scheduledTime: ''
      },
      waypoints: [
        {
            id: 'awaji_sa',
            name: 'Awaji SA',
            coords: { lat: 0, lng: 0 },
            type: 'parking',
            description: '',
            image: '',
            quests: [],
            specs: {},
            weather: { type: 'sunny', temp: '' },
            scheduledTime: ''
        },
        {
            id: 'next_wp',
            name: 'Next WP',
            coords: { lat: 0, lng: 0 },
            type: 'parking',
            description: '',
            image: '',
            quests: [],
            specs: {},
            weather: { type: 'sunny', temp: '' },
            scheduledTime: ''
        },
      ],
      currentSpeed: 0,
      currentLocation: { lat: 0, lng: 0 },
      geoFences: [],
    } as any);
  });

  it('detects re-renders via random value changes', () => {
    const { container } = render(<HighwaySignWidget />);

    const initialText = container.textContent;

    // Update unrelated state (currentSpeed)
    act(() => {
        // use setState directly to avoid side effects of updateLocation if any,
        // but updateLocation is what we want to simulate usage of.
        // Let's just set state directly to be pure.
        useNavStore.setState({ currentSpeed: 100 });
    });

    const newText = container.textContent;

    // If it re-renders, Math.random() generates new numbers, so text changes.
    // If it is optimized, it won't re-render, text stays same.
    // For the baseline, we assert that they are different.
    // But since I need this test to pass *after* optimization, I should write the assertion to check for *equality*?
    // No, step 3 is "Run Benchmark... (expect failure)".
    // So I will write the expectation that checks for difference, run it, confirm it passes (meaning it CHANGED, so inefficient).
    // Then I will change the test to expect equality?
    // Or I can write a test that logs the result.

    // Better: Write the test to expect *stability* (optimization goal).
    // So initially, this test should FAIL.

    expect(initialText).toBe(newText);
  });
});
