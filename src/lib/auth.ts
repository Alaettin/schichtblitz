// Dev-Auth: Hardcoded user for development
// Replace this file with Clerk integration later

export interface User {
  id: string
  name: string
  email: string
}

const DEV_USER: User = {
  id: "dev-user-1",
  name: "Dev Admin",
  email: "dev@schichtblitz.local",
}

export function getCurrentUser(): User {
  return DEV_USER
}
