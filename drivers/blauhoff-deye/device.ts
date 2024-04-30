/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { BaseDevice } from '../../models/base-device';

class BlauhoffDeye extends BaseDevice {
    onInit = async (): Promise<void> => {
        await super.onInit();
    };
}

module.exports = BlauhoffDeye;
