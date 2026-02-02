import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getEnv } from '../utils/env';

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

const SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';

const generateRandomString = (length: number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const useSpotify = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spotify_access_token'));
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const CLIENT_ID = getEnv('VITE_SPOTIFY_CLIENT_ID');
  const REDIRECT_URI = getEnv('VITE_SPOTIFY_REDIRECT_URI') || 'http://localhost:5173/';

  const login = async () => {
    if (!CLIENT_ID) {
       alert("Spotify Client ID is missing in .env");
       return;
    }
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);

    window.location.href = authUrl.toString();
  };

  const handleLogin = login;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const verifier = localStorage.getItem('spotify_code_verifier');
      if (verifier) {
        // Exchange code for token
        axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(response => {
           const { access_token, refresh_token } = response.data;
           localStorage.setItem('spotify_access_token', access_token);
           if (refresh_token) localStorage.setItem('spotify_refresh_token', refresh_token);

           // Clear code from URL
           window.history.replaceState({}, document.title, window.location.pathname);
           setToken(access_token);
           localStorage.removeItem('spotify_code_verifier');
        }).catch(err => {
          console.error("Spotify Token Exchange Error:", err);
          alert("Failed to login to Spotify");
        });
      }
    }
  }, [CLIENT_ID, REDIRECT_URI]);

  const refreshToken = useCallback(async () => {
    const rToken = localStorage.getItem('spotify_refresh_token');
    if (!rToken || !CLIENT_ID) return false;

    try {
       const res = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: rToken,
          client_id: CLIENT_ID,
       }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
       });

       const { access_token, refresh_token: newRefreshToken } = res.data;
       localStorage.setItem('spotify_access_token', access_token);
       if (newRefreshToken) localStorage.setItem('spotify_refresh_token', newRefreshToken);
       setToken(access_token);
       return true;
    } catch (e) {
       console.error("Token refresh failed", e);
       localStorage.removeItem('spotify_access_token');
       localStorage.removeItem('spotify_refresh_token');
       setToken(null);
       return false;
    }
  }, [CLIENT_ID]);

  const fetchState = useCallback(async () => {
     if (!token) return;
     try {
       const res = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
         headers: { Authorization: `Bearer ${token}` }
       });

       if (res.status === 204 || res.status > 400) {
         return;
       }

       const data = res.data;
       setTrack(data.item);
       setIsPlaying(data.is_playing);

     } catch (e: any) {
       console.error("Fetch playback error", e);
       if (e.response?.status === 401) {
         void refreshToken();
       }
     }
  }, [token, refreshToken]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchState();
      const interval = setInterval(fetchState, 5000);
      return () => clearInterval(interval);
    }
  }, [token, fetchState]);

  const handleNext = async () => {
    if (!token) return;
    try {
      await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(fetchState, 500);
    } catch (e) {
      console.error("Next track error", e);
    }
  };

  const handlePlayPause = async () => {
    if (!token) return;
    try {
      const endpoint = isPlaying ? 'pause' : 'play';
      await axios.put(`https://api.spotify.com/v1/me/player/${endpoint}`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
       // Optimistic update
       setIsPlaying(!isPlaying);
       setTimeout(fetchState, 500);
    } catch (e) {
      console.error("Play/Pause error", e);
      // Revert if failed
      setIsPlaying(!isPlaying);
    }
  };

  return { token, track, isPlaying, handleLogin, handleNext, handlePlayPause };
};
