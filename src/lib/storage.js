export const STORAGE_KEYS = {
  HEMISPHERE_PREFERENCE: 'hemisphere_preference',
  MARK_EASTER_EGG: 'pear_mark_easter_egg',
};

export function storageGetRaw(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}

export function storageSetRaw(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private browsing)
  }
}
