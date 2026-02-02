import { renderHook, act } from '@testing-library/react';
import { useSpotify } from './useSpotify';
import { describe, it, expect, vi } from 'vitest';

describe('useSpotify', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useSpotify());
    expect(result.current.token).toBeNull();
    expect(result.current.isPlaying).toBe(false);
  });

  it('handleLogin shows alert', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useSpotify());

    act(() => {
      result.current.handleLogin();
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });
});
