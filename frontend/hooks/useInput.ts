import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';

function useInput<T>(
  initalValue: T,
  // eslint-disable-next-line no-unused-vars
): [T, (e: React.ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initalValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, handler, setValue];
}

export default useInput;
