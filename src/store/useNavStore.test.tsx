import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useNavStore } from './useNavStore';
import * as firebaseDatabase from 'firebase/database';

// Mock firebase/database
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  update: vi.fn(),
  getDatabase: vi.fn(),
}));

// Mock src/lib/firebase
vi.mock('../lib/firebase', () => ({
  db: {},
}));

describe('useNavStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state manually if needed, or rely on individual test isolation strategies
    useNavStore.setState({
      mode: 'driver',
      currentUser: null,
      expenses: [],
      // Add other essential initial states if they affect tests
    });
  });

  it('sets mode correctly', () => {
    const { setMode } = useNavStore.getState();
    setMode('passenger');
    expect(useNavStore.getState().mode).toBe('passenger');
  });

  it('sets current user', () => {
    const { setCurrentUser } = useNavStore.getState();
    setCurrentUser('Naoto');
    expect(useNavStore.getState().currentUser).toBe('Naoto');
  });

  it('sets next waypoint and syncs to firebase', () => {
    const { setNextWaypoint } = useNavStore.getState();
    const mockRef = {};
    (firebaseDatabase.ref as unknown as Mock).mockReturnValue(mockRef);

    // Assuming 'awaji_sa' exists in the waypoints data imported in useNavStore
    setNextWaypoint('awaji_sa');

    // Check if Firebase set was called
    // We expect at least two calls: one for waypoint, one for notification
    expect(firebaseDatabase.ref).toHaveBeenCalledWith(expect.anything(), 'state/nextWaypoint');
    expect(firebaseDatabase.set).toHaveBeenCalled();
  });
});
