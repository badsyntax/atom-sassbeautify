/**
 * SassBeautify Package for Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2013 Richard Willis; Licensed MIT
 */

var package = module.exports;

function getType(file) {
  return file.getPath() === undefined ? undefined : file.getGrammar().name.toLowerCase();
}

function getArgs(file) {

  var type = getType(file);
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

function process(file) {

  var process = require('child_process').spawn('sass-convert', getArgs(file));

  process.stdout.setEncoding('utf8');
  process.stderr.setEncoding('utf8');
  process.stdin.setEncoding('utf8');

  process.stdout.on('data', file.setText.bind(file));

  process.stderr.on('data', function (data) {
    window.alert('There was an error beautifying your Sass:\n\n' + data);
  });

  process.stdin.write(file.getText());
  process.stdin.end();
}

function beautify() {

  var file = atom.workspace.activePaneItem;
  var type = getType(file);

  if (type === undefined) {
    return window.alert('Please save this file before trying to beautify.');
  }

  if (['scss','sass'].indexOf(type) === -1) {
    return window.alert('Not a valid Sass file.');
  }

  process(file);
}

package.configDefaults = {
	indent: 4,
	dasherize: false,
	old: false
};

package.activate = function() {
  atom.workspaceView.command('SassBeautify', beautify);
};
