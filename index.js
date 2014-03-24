/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

/* global atom */
'use strict';

var plugin = module.exports;

/**
 * Default package options.
 * @type {Object}
 */
plugin.configDefaults = {
  indent: 4,
  dasherize: false,
  old: false,
  path: ''
};

/**
 * Package activate init, set the commands.
 */
plugin.activate = function() {
  atom.workspaceView.command('SassBeautify', this.beautify.bind(this));
};

/**
 * Get the saved file type from the editor.
 * @return {undefined|string} The file type.
 */
plugin.getType = function() {
  return this.editor.getPath() === undefined ? undefined : this.editor.getGrammar().name.toLowerCase();
};

/**
 * Get the sass-convert arguments.
 * @return {array} The arguments array.
 */
plugin.getArgs = function() {

  var args = [
    '--unix-newlines',
    '--stdin',
  ];

  args.push('--indent', this.config.indent);
  args.push('--from', this.type);
  args.push('--to', this.type);

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
plugin.process = function(done) {

  var args = this.getArgs();
  var opts = {};
  var out;

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
 * Process handler.
 * @param  {null|string} err The error string.
 * @param  {null|string} data The process output.
 */
plugin.onProcess = function(err, data) {
  this.status('');
  if (err) {
    return window.alert('There was an error beautifying your Sass:\n\n' + err);
  }
  this.editor.setText(data);
};

/**
 * Status text helper.
 * @param {string} text The text to display in the status bar.
 */
plugin.status = function(text) {
  if (!this.statusElement) {
    this.statusElement = window.document.createElement('span');
    atom.workspaceView.statusBar.appendLeft(this.statusElement);
  }
  this.statusElement.innerText = text;
};

/**
 * The main beautify command, executed when any SassBeautify commands are run.
 */
plugin.beautify = function() {

  this.editor = atom.workspace.getActiveEditor();
  this.config = atom.config.get('sassbeautify');
  this.type = this.getType();

  if (this.type === undefined) {
    return window.alert('Please save this file before trying to beautify.');
  }

  if (['scss','sass'].indexOf(this.type) === -1) {
    return window.alert('Not a valid Sass file.');
  }

  this.status('Beautifying, please wait...');
  this.process(this.onProcess.bind(this));
};
