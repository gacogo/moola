interface CopyBag<T = string> {
  payload: Array<[T, bigint]>;
}

interface Purse {
  brand: unknown;
  brandPetname: string;
  currentAmount: {
    value: bigint| CopyBag;
  };
  displayInfo: {
    decimalPlaces: number;
    assetKind: unknown;
  };
}
