/**
 * SassBeautify Package for Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2013 Richard Willis; Licensed MIT
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
 * Get the saved file type from the editor.
 * @param  {atom.workspace.activePaneItem} editor The active editor.
 * @return {undefined|string} The file type.
 */
function getType(file) {
  return file.getPath() === undefined ? undefined : file.getGrammar().name.toLowerCase();
}

/**
 * Get the sass-convert arguments.
 * @param  {atom.workspace.activePaneItem} editor The active editor.
 * @return {array} The arguments array.
 */
function getArgs(editor) {

  var type = getType(editor);
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
}

/**
 * Run the sass-convert process.
 * @param  {atom.workspace.activePaneItem} editor The active editor.
 * @param  {Function} done Callback function.
 */
function process(editor, done) {

  var args = getArgs(editor);
  var cp = require('child_cp').spawn('sass-convert', args);

  cp.stdout.setEncoding('utf8');
  cp.stderr.setEncoding('utf8');
  cp.stdin.setEncoding('utf8');

  cp.stdout.on('data', done);

  cp.stderr.on('data', function (data) {
    window.alert('There was an error beautifying your Sass:\n\n' + data);
  });

  cp.stdin.write(editor.getText());
  cp.stdin.end();
}

/**
 * The main beautify command, executed when any SassBeautify commands are run.
 */
function beautify() {

  var editor = atom.workspace.activePaneItem;
  var type = getType(editor);

  if (type === undefined) {
    return window.alert('Please save this file before trying to beautify.');
  }

  if (['scss','sass'].indexOf(type) === -1) {
    return window.alert('Not a valid Sass file.');
  }

  process(editor, editor.setText.bind(editor));
}

plugin.activate = function() {
  atom.workspaceView.command('SassBeautify', beautify);
};
