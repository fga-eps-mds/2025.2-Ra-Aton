/**
 * Polyfill para localStorage no ambiente web do Expo
 * Necessário porque expo-notifications tenta usar localStorage.getItem
 * mas o ambiente SSR do Metro não tem localStorage disponível
 */

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

// Polyfill para Node.js (SSR/Bundling)
if (typeof global !== 'undefined' && (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function')) {
  // @ts-ignore
  global.localStorage = noopStorage;
}

// Polyfill para Browser/Window
if (typeof window !== 'undefined' && (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function')) {
  // @ts-ignore
  Object.defineProperty(window, 'localStorage', {
    value: noopStorage,
    writable: true
  });
}

export {};
