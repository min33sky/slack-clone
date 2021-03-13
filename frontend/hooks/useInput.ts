import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';

type ReturnTypes<T> = [
  T,
  (_e: React.ChangeEvent<HTMLInputElement>) => void,
  Dispatch<SetStateAction<T>>
];

/**
 * Custom Input Hook
 * @param initalValue 상태 초기값
 * @returns [상태 값, 인풋 이벤트 핸들러, 상태값 변경 함수]
 */
function useInput<T>(initalValue: T): ReturnTypes<T> {
  const [value, setValue] = useState(initalValue);
  const handler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue((e.target.value as unknown) as T);
  }, []);

  return [value, handler, setValue];
}

export default useInput;
