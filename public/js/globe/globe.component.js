(function() {
  'use strict'

  angular.module('app')
    .component('globe', {
      templateUrl: '/js/globe/globe.template.html',
      controller: controller
    })


    function controller() {

      const vm = this

      vm.$onInit = onInit
      // vm.earthDoneLoading = false
      // vm.searchService = searchService

      function onInit() {

      }



    }
}());
