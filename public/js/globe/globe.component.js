(function() {
  'use strict'

  angular.module('app')
    .component('globe', {
      templateUrl: '/js/globe/globe.template.html',
      controller: controller
    })

    controller.$inject = ['searchService']

    function controller(searchService) {
      
      const vm = this
      vm.$onInit = onInit
      vm.searchService = searchService
      vm.course = searchService.currentCourse

      function onInit() {
        searchService.getAllCourses().then(function (response) {
          vm.courses = response.data
          vm.latlons = vm.courses.map(function(course) {
            return [parseFloat(course.lat), parseFloat(course.lng)]
          })
          vm.courseNames = vm.courses.map(function(course) {
            return course.name
          })
        })
      }
    }
}());
