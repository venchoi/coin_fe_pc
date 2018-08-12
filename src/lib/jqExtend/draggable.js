import $ from 'jquery';

(function($) {
  'use strict';
  $.fn.drag = function(options) {
      var $doc = $(document),
          fnEmpty = function() {},

          settings = $.extend({

              down: fnEmpty,
              move: fnEmpty,
              up: fnEmpty,
              limit: false,
              moveElem: null

          }, options);

      return this.each(function() {
          var $this = $(this),
              moveElem = settings.moveElem || $this;

          if (typeof settings.moveElem == 'function') {

              moveElem = $(settings.moveElem.call(this));

          }

          $this.on('mousedown.drag', function(e) {
              var tagName = e.target.tagName.toLowerCase();
              if (tagName == 'input' || tagName == 'textarea' || tagName == 'select') {
                  return;
              }
              if (settings.limit) {

                  var winWidth = $(window).width(),
                      winHeight = $(window).height(),

                      range = function(val, min, max) {
                          return val < min ? min : val > max ? max : val;
                      };

              }

              var self = this,
                  offset = moveElem.offset(),
                  disX = e.pageX - offset.left,
                  disY = e.pageY - offset.top;

              settings.down.call(self);

              $doc.on({
                  'mousemove.drag': function(e) {
                      var left = e.clientX - disX,
                          top = e.clientY - disY;

                      if (range) {
                          left = range(left, 0, winWidth - moveElem.outerWidth());
                          top = range(top, 0, winHeight - moveElem.outerHeight());
                      }

                      moveElem.css({
                          left: left,
                          top: top
                      });

                      settings.move.call(self, left, top);

                  },
                  'mouseup.drag': function() {

                      $doc.off('mousemove.drag mouseup.drag');
                      settings.up.call(self);

                  }
              });

              return false;
          });
      });
  };
})($);
