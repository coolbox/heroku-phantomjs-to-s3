/**
 * @module Logging
 *
 * @fileOverview
 * Some description…
 */
var Rollbar = require('rollbar');
var rollbar = new Rollbar({
 accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
 captureUncaught: true,
 captureUnhandledRejections: true
});

function getDebugger() {
  rollbar.log("Initiated Rollbar 🎉");
  return rollbar;
}

exports.getDebugger = getDebugger;
