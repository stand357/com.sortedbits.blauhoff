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
