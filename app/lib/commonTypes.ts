export type stateType<T> = {
  value: T
  setValue: (params: T) => void
};

export type voidFunc<T = void> = (params: T) => void;
