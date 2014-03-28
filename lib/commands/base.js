/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

/* global atom, window */
'use strict';

var $ = require('atom').$;

/**
 * Our base command constructor.
 */
var BaseCommand = module.exports = function(plugin) {
  this.config = atom.config.get('sassbeautify');
  this.plugin = plugin;
};

/**
 * Command init, executed every time the command is run.
 * @param {object} options Command options.
 */
BaseCommand.prototype.init = function(options) {

  this.editor = atom.workspaceView.getActivePaneItem();
  this.options = options || {};
  this.type = this.getType();

  if (!this.validate()) {
    return;
  }

  this.run();
};

/**
 * Validate the current file and show an error message if validation fails.
 * @return {boolean}
  */
BaseCommand.prototype.validate = function() {
  if (this.type === undefined) {
    this.error('Please save this file first.');
    return false;
  }
  if (['scss','sass'].indexOf(this.type) === -1) {
    this.error('Not a valid Sass file.');
    return false;
  }
  return true;
};

/**
 * Get the file type from the editor.
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
BaseCommand.prototype.process = function(args) {

  var opts = {};
  var done = this.onProcess.bind(this);

  // Add custom PATH.
  if (this.config.path) {
    opts.env = process.env;
    opts.env.PATH = this.config.path;
  }

  var cp = require('child_process').spawn('sass-convert', args, opts);

  cp.stdout.setEncoding('utf8');
  cp.stderr.setEncoding('utf8');
  cp.stdin.setEncoding('utf8');

  var out = '';

  cp.stdout.on('data', function(data) {
    out += data;
  });
  cp.stdout.on('end', function() {
    done(null, out);
  })
  cp.stderr.on('data', done);

  cp.stdin.write(this.editor.getText());
  cp.stdin.end();
};

/**
 * Status text helper.
 * @param {string} text The text to display in the status bar.
 * @param {boolean} showActivity Show an activity indicator?
 */
BaseCommand.prototype.status = function(text, showActivity) {
  if (!this.plugin.statusView) {
    this.initStatusView();
  }
  this.plugin.statusView.update(text, showActivity);
};

/**
 * Create the status view instance.
 */
BaseCommand.prototype.initStatusView = function() {
  var StatusView = require('../views/status');
  this.plugin.statusView = new StatusView();
  atom.workspaceView.statusBar.appendLeft(this.plugin.statusView);
};

/**
 * Error handler: show an error message.
 * @param {string} msg The error message.
 */
BaseCommand.prototype.error = function(msg) {
  this.status('');
  window.alert(msg);
};

/**
 * Success handler: update the editor text and set the status with success msg.
 * @param {string} msg The success message.
 * @param {string} data The new text to replace the current text.
 */
BaseCommand.prototype.success = function(msg, data) {
  this.editor.setText(data);
  this.status(msg);
  setTimeout(this.status.bind(this, ''), 4000);
};
