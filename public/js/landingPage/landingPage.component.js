(function() {
  'use strict'

  angular.module('app')
    .component('landingPage', {
      templateUrl: '/js/landingPage/landingPage.template.html',
      controller: controller
    })

    function controller() {

      const vm = this

      vm.$onInit = onInit

      function onInit() {

      }
    }
}());
