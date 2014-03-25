/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

/* global atom */
'use strict';

var $ = require('atom').$;

var BaseCommand = module.exports = function(plugin) {
  this.plugin = plugin;
};

BaseCommand.prototype.init = function(options) {

  this.editor = atom.workspaceView.getActivePaneItem();
  this.config = atom.config.get('sassbeautify');
  this.options = options || {};
  this.type = this.getType();

  if (this.type === undefined) {
    return window.alert('Please save this file first.');
  }
  if (['scss','sass'].indexOf(this.type) === -1) {
    return window.alert('Not a valid Sass file.');
  }

  this.run();
};

/**
 * Get the saved file type from the editor.
 * @return {undefined|string} The file type.
 */
BaseCommand.prototype.getType = function() {
  return this.editor.getPath() === undefined ? undefined : this.editor.getGrammar().name.toLowerCase();
};

/**
 * Get the sass-convert arguments.
 * @return {array} The arguments array.
 */
BaseCommand.prototype.getArgs = function(opts) {

  var args = [
    '--unix-newlines',
    '--stdin',
  ];

  opts = $.extend({
    from: this.type,
    to: this.type,
    indent: this.config.indent
  }, opts);

  Object.keys(opts).forEach(function(key) {
    args.push('--' + key, opts[key]);
  });

  if (this.config.dasherize) {
    args.push('--dasherize');
  }
  if (this.config.old && this.type === 'sass') {
    args.push('--old');
  }

  return args;
};

/**
 * Run the sass-convert process.
 * @param  {Function} done Callback function.
 */
BaseCommand.prototype.process = function(args, done) {

  var opts = {};

  // Add custom PATH.
  if (this.config.path) {
    opts.env = process.env;
    opts.env.PATH = this.config.path;
  }

  var cp = require('child_process').spawn('sass-convert', args, opts);

  cp.stdout.setEncoding('utf8');
  cp.stderr.setEncoding('utf8');
  cp.stdin.setEncoding('utf8');

  cp.stdout.on('data', done.bind(null, null));
  cp.stderr.on('data', done);

  cp.stdin.write(this.editor.getText());
  cp.stdin.end();
};

/**
 * Status text helper.
 * @param {string} text The text to display in the status bar.
 */
BaseCommand.prototype.status = function(text) {
  if (!this.statusElement) {
    this.statusElement = $('<span />');
    atom.workspaceView.statusBar.appendLeft(this.statusElement);
  }
  this.statusElement.text(text);
};

BaseCommand.prototype.onError = function(msg) {
  this.status('');
  window.alert(msg);
};

BaseCommand.prototype.onSuccess = function(msg, data) {
  this.editor.setText(data);
  this.status(msg);
  setTimeout(this.status.bind(this, ''), 4000);
};
