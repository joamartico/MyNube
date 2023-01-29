import { useEffect, useState } from 'react';

export function getLocalStorage(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      console.log(error);
      setStoredValue(initialValue)
    }
  }, [])
  

  const setValue = value => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
