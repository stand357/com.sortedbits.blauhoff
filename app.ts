/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

'use strict';

import Homey from 'homey';

class BlauHoffApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('BlauHoffApp has been initialized');
  }

}

module.exports = BlauHoffApp;
