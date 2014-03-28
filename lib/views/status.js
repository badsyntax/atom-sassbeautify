/**
 * SassBeautify Package for the Atom editor
 * V0.0.0
 * https://github.com/badsyntax/atom-sassbeautify
 * Copyright (c) 2014 Richard Willis; Licensed MIT
 */

var util = require('util');
var View = require('atom').View;

/* Yeah, just pretend we don't have to do this for now. Goddamn CS. */
var __hasProp = {}.hasOwnProperty;
var __extends = function(child, parent) {
  for (var key in parent) {
    if (__hasProp.call(parent, key)) child[key] = parent[key];
  }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
};

var StatusView = module.exports = function() {
  StatusView.__super__.constructor.apply(this, arguments);
  this.msgElement = this.find('.msg');
  this.activityElement = this.find('.activity');
};
__extends(StatusView, View);

StatusView.content = function() {
  return this.span(function() {
    this.span({ 'class': 'activity' });
    this.span({ 'class': 'msg' })
  }.bind(this));
};

StatusView.prototype.update = function(msg, showActivity) {
  this.clearActivity();
  this.msgElement.text(msg);
  if (showActivity) {
    this.showActivity();
  }
};

StatusView.prototype.showActivity = function(i, dir) {

  i = i || 0;
  dir = dir || 1;

  var before = i % 6;
  var after = 5 - before

  if (!after) {
    dir = -1;
  }
  if (!before) {
    dir = 1;
  }
  i += dir;

  this.activityElement.html(
    util.format('[%s=%s] ',
      new Array(before+1).join('&nbsp;'),
      new Array(after+1).join('&nbsp;')
    )
  );

  this.activityTimer = setTimeout(this.showActivity.bind(this, i, dir), 100);
};

StatusView.prototype.clearActivity = function() {
  clearTimeout(this.activityTimer);
  this.find('.activity').empty();
};
