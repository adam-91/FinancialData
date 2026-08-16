import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";

export function useSessionDefault<T>(
  makeDefault: () => T,
  ready: boolean,
  version: number
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(makeDefault);
  const makeDefaultRef = useRef(makeDefault);
  makeDefaultRef.current = makeDefault;
  const appliedVersionRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    if (appliedVersionRef.current === version) return;
    appliedVersionRef.current = version;
    setValue(makeDefaultRef.current());
  }, [ready, version]);

  return [value, setValue];
}
