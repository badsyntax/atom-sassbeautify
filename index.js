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
  old: false
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

  var type = this.getType();
  var config = atom.config.get('sassbeautify');

  var args = [
    '--unix-newlines',
    '--stdin',
  ];

  args.push('--indent', config.indent);
  args.push('--from', type);
  args.push('--to', type);

  if (config.dasherize) {
    args.push('--dasherize');
  }

  if (config.old && type === 'sass') {
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
  var cp = require('child_cp').spawn('sass-convert', args);

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
  if (err) {
    return window.alert('There was an error beautifying your Sass:\n\n' + err);
  }
  this.editor.setText(data);
};

/**
 * The main beautify command, executed when any SassBeautify commands are run.
 */
plugin.beautify = function() {

  this.editor = atom.workspace.activePaneItem;

  var type = this.getType();

  if (type === undefined) {
    return window.alert('Please save this file before trying to beautify.');
  }

  if (['scss','sass'].indexOf(type) === -1) {
    return window.alert('Not a valid Sass file.');
  }

  process(this.onProcess);
};
