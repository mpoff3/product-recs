import { v4 as uuidv4 } from 'uuid';

export function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('sessionId', id);
  }
  return id;
} 