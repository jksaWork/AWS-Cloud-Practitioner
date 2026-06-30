const USER_KEY = 'aws-quiz-current-user';

export function setCurrentUser(username: string): void {
  localStorage.setItem(USER_KEY, username.trim());
}

export function getCurrentUser(): string | null {
  const user = localStorage.getItem(USER_KEY);
  return user?.trim() || null;
}

export function clearCurrentUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getUserInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}
