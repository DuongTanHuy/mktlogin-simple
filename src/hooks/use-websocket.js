import { useContext } from 'react';
import { UserProfileStateContext } from '../websockets/context/user-profile-state-context';

export function useWebSocket() {
  const socket = useContext(UserProfileStateContext);
  return socket;
}
