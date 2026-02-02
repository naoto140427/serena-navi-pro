// @vitest-environment jsdom
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpotify } from './useSpotify';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import * as envUtils from '../utils/env';

vi.mock('axios');
vi.mock('../utils/env');

describe('useSpotify', () => {
  const originalLocation = window.location;
  const mockLocation = {
    ...originalLocation,
    href: '',
    search: '',
    pathname: '/',
    assign: vi.fn(),
    origin: 'http://localhost:3000'
  };

  const alertMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock getEnv
    vi.mocked(envUtils.getEnv).mockImplementation((key) => {
        if (key === 'VITE_SPOTIFY_CLIENT_ID') return 'test_client_id';
        if (key === 'VITE_SPOTIFY_REDIRECT_URI') return 'http://localhost:3000/callback';
        return '';
    });

    // Mock window.alert
    vi.stubGlobal('alert', alertMock);

    // Mock window.location
    delete (window as any).location;
    window.location = { ...mockLocation } as any;

    // Mock crypto
    if (!window.crypto) {
        (window as any).crypto = {};
    }
    if (!window.crypto.subtle) {
        (window.crypto as any).subtle = {};
    }

    window.crypto.subtle.digest = vi.fn().mockResolvedValue(new ArrayBuffer(32));
    window.crypto.getRandomValues = vi.fn((arr) => arr);
  });

  afterEach(() => {
     vi.unstubAllGlobals();
  });

  it('should initialize with null token', () => {
    const { result } = renderHook(() => useSpotify());
    expect(result.current.token).toBeNull();
  });

  it('should initiate login by setting location.href', async () => {
    const { result } = renderHook(() => useSpotify());

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(window.location.href).toContain('accounts.spotify.com/authorize');
    expect(window.location.href).toContain('response_type=code');
    expect(window.location.href).toContain('client_id=test_client_id');
    expect(localStorage.getItem('spotify_code_verifier')).toBeTruthy();
  });

  it('should exchange code for token on mount if code is present', async () => {
    window.location.search = '?code=test_code';
    localStorage.setItem('spotify_code_verifier', 'test_verifier');

    (axios.post as any).mockResolvedValue({
      data: {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600
      }
    });

    // Mock get to avoid error during immediate poll
    (axios.get as any).mockResolvedValue({
        status: 200,
        data: { item: null, is_playing: false }
    });

    const { result } = renderHook(() => useSpotify());

    await waitFor(() => {
        expect(result.current.token).toBe('test_access_token');
    });

    expect(axios.post).toHaveBeenCalledWith(
      'https://accounts.spotify.com/api/token',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    );
    expect(localStorage.getItem('spotify_access_token')).toBe('test_access_token');
  });

  it('should poll for playback state when token is present', async () => {
    localStorage.setItem('spotify_access_token', 'existing_token');

    (axios.get as any).mockResolvedValue({
      status: 200,
      data: {
        item: { name: 'Test Track' },
        is_playing: true
      }
    });

    const { result } = renderHook(() => useSpotify());

    await waitFor(() => {
        expect(result.current.track).toEqual({ name: 'Test Track' });
        expect(result.current.isPlaying).toBe(true);
    });

    expect(axios.get).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/player/currently-playing',
        expect.objectContaining({
            headers: { Authorization: 'Bearer existing_token' }
        })
    );
  });
});
