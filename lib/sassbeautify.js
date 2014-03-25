/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

/* global atom */
'use strict';

var plugin = module.exports;
var BeautifyCommand = require('./beautify-command');
var ConvertCommand = require('./convert-command');

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
 * Set the commands.
 */
plugin.activate = function() {

  var beautifyCommand = new BeautifyCommand(this);
  var convertCommand = new ConvertCommand(this);

  atom.workspaceView.command('SassBeautify',
    beautifyCommand.init.bind(beautifyCommand));

  atom.workspaceView.command('SassBeautify:Convert-from-SASS',
    convertCommand.init.bind(convertCommand, {
      from: 'sass'
    }));

  atom.workspaceView.command('SassBeautify:Convert-from-SCSS',
    convertCommand.init.bind(convertCommand, {
      from: 'scss'
    }));

  atom.workspaceView.command('SassBeautify:Convert-from-CSS',
    convertCommand.init.bind(convertCommand, {
      from: 'css'
    }));
};
