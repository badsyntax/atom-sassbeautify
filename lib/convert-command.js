/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

'use strict';

var util = require('util');
var BaseCommand = require('./base-command');

var ConvertCommand = module.exports = function() {
  BaseCommand.apply(this, arguments);
};

util.inherits(ConvertCommand, BaseCommand);

ConvertCommand.prototype.run = function() {
  this.status('Converting, please wait...');
  this.process(this.getArgs({
    from: this.options.from
  }), this.onProcess.bind(this));
};

/**
 * Process handler.
 * @param  {null|string} err The error string.
 * @param  {null|string} data The process output.
 */
ConvertCommand.prototype.onProcess = function(err, data) {
  if (err) {
    this.onError(util.format('There was an error converting your %s:\n\n%s', this.options.from, err));
  } else {
    this.onSuccess(util.format('Successfully converted: %s', this.editor.getPath()), data);
  }
};
