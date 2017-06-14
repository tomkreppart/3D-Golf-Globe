(function() {
  'use strict'

  angular.module('app')
    .component('courses', {
      templateUrl: '/js/globe/courses.template.html',
      controller: controller
    })

    controller.$inject = ['searchService', '$stateParams', '$state']

    function controller(searchService, $stateParams, $state) {
      const vm = this

      vm.$onInit = onInit
      vm.searchService = searchService
      // vm.course.name = name;
      // vm.courseInfo = courseInfo

      function onInit() {
        searchService.getOneCourse($stateParams.id).then(function (response) {
          vm.course = response.data
          console.log(response.data);
          // console.log(vm.courseInfo);
        })
      }
    }
}());
