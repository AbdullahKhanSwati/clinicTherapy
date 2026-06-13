import { createContext, useContext } from 'react';

// Shared auth context — defined outside App.js to break the circular import
// between App.js (which imports every screen) and the screens (which need
// `useAuth`).
//
// App.js wraps the tree with <AuthContext.Provider value={...}>. Screens
// pull the value via `useAuth()`.
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
