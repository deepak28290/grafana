define([
  'angular',
  'app',
  'underscore',
  'jquery',
  '../services/graphite/gfunc',
],
function (angular, app, _, $, gfunc) {
  'use strict';


  angular
    .module('kibana.directives')
    .directive('graphiteAddFunc', function($compile) {
      var inputTemplate = '<input type="text"'+
                            ' class="grafana-target-segment-input input-medium grafana-target-segment-input"' +
                            ' spellcheck="false" style="display:none"></input>';

      var buttonTemplate = '<a  class="grafana-target-segment grafana-target-function dropdown-toggle"' +
                              ' tabindex="1" gf-dropdown="functionMenu" data-toggle="dropdown"' +
                              ' data-placement="bottom"><i class="icon-plus"></i></a>';

      return {
        link: function($scope, elem) {
          var categories = gfunc.getCategories();
          var allFunctions = getAllFunctionNames(categories);

          $scope.functionMenu = createFunctionDropDownMenu(categories);

          var $input = $(inputTemplate);
          var $button = $(buttonTemplate);
          $input.appendTo(elem);
          $button.appendTo(elem);

          $input.attr('data-provide', 'typeahead');
          $input.typeahead({
            source: allFunctions,
            minLength: 1,
            items: 10,
            updater: function (value) {
              var funcDef = gfunc.getFuncDef(value);

              $scope.$apply(function() {
                $scope.addFunction(funcDef);
              });

              $input.trigger('blur');
              return '';
            }
          });

          $button.click(function() {
            $button.hide();
            $input.show();
            $input.focus();
          });

          $input.keyup(function() {
            elem.toggleClass('open', $input.val() === '');
          });

          $input.blur(function() {
            $input.hide();
            $input.val('');
            $button.show();
            $button.focus();
            // clicking the function dropdown menu wont
            // work if you remove class at once
            setTimeout(function() {
              elem.removeClass('open');
            }, 200);
          });

          $compile(elem.contents())($scope);
        }
      };
    });

  function getAllFunctionNames(categories) {
    return _.reduce(categories, function(list, category) {
      _.each(category, function(func) {
        list.push(func.name);
      });
      return list;
    }, []);
  }

  function createFunctionDropDownMenu(categories) {
    return _.map(categories, function(list, category) {
      return {
        text: category,
        submenu: _.map(list, function(value) {
          return {
            text: value.name,
            click: "addFunction('" + value.name + "')",
          };
        })
      };
    });
  }
});