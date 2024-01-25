export type stateType<T> = {
  value: T
  setValue: (params: T) => void
};

export type voidFunc<T = void> = (params: T) => void;

export type userInfo = {
  _id: string
  info: {
    name: string
    address: string
    email: string
    balance: number
  }
};
