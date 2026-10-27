import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';

// Local sound asset imports
const MOVE_SOUND = require('../../assets/sounds/move.mp3');
const ILLEGAL_SOUND = require('../../assets/sounds/illegal.mp3');

export function useSoundEffects() {
  const movePlayer = useAudioPlayer(MOVE_SOUND);
  const illegalPlayer = useAudioPlayer(ILLEGAL_SOUND);

  const playMoveSound = useCallback(() => {
    try {
      movePlayer.seekTo(0);
      movePlayer.play();
    } catch {
      // Audio playback fails gracefully if audio system is interrupted
    }
  }, [movePlayer]);

  const playIllegalSound = useCallback(() => {
    try {
      illegalPlayer.seekTo(0);
      illegalPlayer.play();
    } catch {
      // Audio playback fails gracefully if audio system is interrupted
    }
  }, [illegalPlayer]);

  return {
    playMoveSound,
    playIllegalSound,
  };
}
