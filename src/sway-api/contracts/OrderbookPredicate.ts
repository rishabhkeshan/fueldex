/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.100.6
  Forc version: 0.68.4
  Fuel-Core version: 0.43.2
*/

import { Contract as __Contract, Interface } from "fuels";
import type {
  Provider,
  Account,
  StorageSlot,
  Address,
  BigNumberish,
  BN,
  FunctionFragment,
  InvokeFunction,
} from 'fuels';

import type { Option } from "./common";

export type OrderbookPredicateConfigurables = Partial<{
  ASSET_ID_GET: string;
  ASSET_ID_SEND: string;
  MINIMAL_OUTPUT_AMOUNT: BigNumberish;
  RECEPIENT: string;
}>;

const abi = {
  "programType": "predicate",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "b256",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b"
    },
    {
      "type": "bool",
      "concreteTypeId": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903"
    },
    {
      "type": "enum std::option::Option<u64>",
      "concreteTypeId": "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
      "metadataTypeId": 1,
      "typeArguments": [
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
      ]
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [
    {
      "type": "()",
      "metadataTypeId": 0
    },
    {
      "type": "enum std::option::Option",
      "metadataTypeId": 1,
      "components": [
        {
          "name": "None",
          "typeId": 0
        },
        {
          "name": "Some",
          "typeId": 2
        }
      ],
      "typeParameters": [
        2
      ]
    },
    {
      "type": "generic T",
      "metadataTypeId": 2
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "out_index",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "cancel",
          "concreteTypeId": "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d"
        }
      ],
      "name": "main",
      "output": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      "attributes": null
    }
  ],
  "loggedTypes": [],
  "messagesTypes": [],
  "configurables": [
    {
      "name": "ASSET_ID_GET",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
      "offset": 4416
    },
    {
      "name": "ASSET_ID_SEND",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
      "offset": 4448
    },
    {
      "name": "MINIMAL_OUTPUT_AMOUNT",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      "offset": 4480
    },
    {
      "name": "RECEPIENT",
      "concreteTypeId": "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
      "offset": 4488
    }
  ]
};

const storageSlots: StorageSlot[] = [];

export class OrderbookPredicateInterface extends Interface {
  constructor() {
    super(abi);
  }

  declare functions: {
    main: FunctionFragment;
  };
}

export class OrderbookPredicate extends __Contract {
  static readonly abi = abi;
  static readonly storageSlots = storageSlots;

  declare interface: OrderbookPredicateInterface;
  declare functions: {
    main: InvokeFunction<[out_index: BigNumberish, cancel?: Option<BigNumberish>], boolean>;
  };

  constructor(
    id: string | Address,
    accountOrProvider: Account | Provider,
  ) {
    super(id, abi, accountOrProvider);
  }
}
