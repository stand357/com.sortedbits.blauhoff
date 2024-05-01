/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

export enum RegisterDataType {
    UINT8 = 'UINT8',
    UINT16 = 'UINT16',
    UINT32 = 'UINT32',
    INT16 = 'INT16',
    INT32 = 'INT32',
    STRING = 'STRING',
    FLOAT32 = 'FLOAT32',
}

export const lengthForDataType = (dataType: RegisterDataType): number => {
    switch (dataType) {
        case RegisterDataType.UINT8:
            return 1;
        case RegisterDataType.UINT16:
        case RegisterDataType.INT16:
            return 2;
        case RegisterDataType.UINT32:
        case RegisterDataType.INT32:
        case RegisterDataType.FLOAT32:
            return 4;
        case RegisterDataType.STRING:
            return 8;
    }
};
