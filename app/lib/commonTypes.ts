export type voidFunc<T = void> = (params: T) => void;

export type stateType<T> = {
  value: T
  setValue: voidFunc<T>
};

export type userInfo = {
  _id: string
  info: {
    name: string
    address: string
    email: string
    balance: number
  }
};

export type patchDataType = {
  id: string,
  update: waterUsageType['data']
};

export type waterUsageType = {
  _id: string,
  name: string,
  data: { prev: yearStructureType, cur: yearStructureType }
};

type yearStructureType = {
  Q1: {1: number, 2: number, 3: number},
  Q2: {1: number, 2: number, 3: number},
  Q3: {1: number, 2: number, 3: number},
  Q4: {1: number, 2: number, 3: number}
};

export type yearType = keyof waterUsageType['data'];
export type quarterType = keyof yearStructureType;
