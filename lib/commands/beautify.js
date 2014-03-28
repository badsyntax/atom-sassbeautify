/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */
'use strict';

var util = require('util');
var BaseCommand = require('./base');

var BeautifyCommand = module.exports = function() {
  BaseCommand.apply(this, arguments);
};
util.inherits(BeautifyCommand, BaseCommand);

/**
 * Runs the command.
 */
BeautifyCommand.prototype.run = function() {
  this.status('Beautifying, please wait...', true);
  this.process(this.getArgs());
};

/**
 * Process handler.
 * @param  {null|string} err The error string.
 * @param  {null|string} data The process output.
 */
BeautifyCommand.prototype.onProcess = function(err, data) {
  if (err) {
    this.error(
      util.format('There was an error beautifying your %s:\n\n%s', this.type, err)
    );
  } else {
    this.success(
      util.format('Successfully beautified: %s', this.editor.getPath()),
      data
    );
  }
};
