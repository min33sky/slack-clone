import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * Custom Input Hook
 * @param initalValue 상태 초기값
 * @returns [상태 값, 인풋 이벤트 핸들러, 상태값 변경 함수]
 */
function useInput<T>(
  initalValue: T
  // eslint-disable-next-line no-unused-vars
): [T, (e: React.ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initalValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, handler, setValue];
}

export default useInput;
