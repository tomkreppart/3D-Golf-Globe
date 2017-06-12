(function() {
  'use strict'

  angular.module('app')
    .component('app', {
      templateUrl: '/js/app/app.template.html',
      controller: controller
    })

    controller.$inject = ['searchService']

    function controller(searchService) {
      const vm = this

      vm.$onInit = onInit
      vm.searchService = searchService

      function onInit() {
        searchService.getAllCourses().then(function (response) {
          vm.courses = response.data
          console.log(vm.courses);
        })
      }
    }
}());
