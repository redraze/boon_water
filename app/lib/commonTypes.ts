// prop types
export type voidFunc<T = void> = (params: T) => void;
export type stateType<T> = {
  value: T
  setValue: voidFunc<T>
};

// users types
export type userInfo = {
  _id: string
  info: {
    name: string
    address: string
    email: string
    balance: number
    comp: boolean
  }
};

// data entry types
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

// balances types
export type usersBalancesType = {
  _id: string,
  name: string,
  prev: balanceEntryType[],
  cur: balanceEntryType[]
};
export type balanceEntryType = {
  timeStamp: number,
  note: string,
  balanceChange: number,
  newBalance: number
};
export type balanceHistoryDictType = {
  [id: string]: {
      name: string,
      prev: balanceEntryType[],
      cur: balanceEntryType[]
  }
};

// billing types
export type readingsDict = {
  [id: string]: number[]
};

export type usersInfoDictType = {
  [id: string]: userInfo['info']
};

export const mDict = {
  1: { Q1: 'January', Q2: 'April', Q3: 'July', Q4: 'October' },
  2: { Q1: 'February', Q2: 'May', Q3: 'August', Q4: 'November' },
  3: { Q1: 'March', Q2: 'June', Q3: 'September', Q4: 'December' }
};
