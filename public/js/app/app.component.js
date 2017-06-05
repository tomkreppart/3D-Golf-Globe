(function() {
  'use strict'

  angular.module('app')
    .component('app', {
      templateUrl: '/js/app/app.template.html',
      controller: controller
    })

    function controller() {
    }
    // controller.$inject = ['searchService']
    //
    // function controller(searchService) {
    //   const vm = this
    //   vm.$onInit = onInit
    //
    //   vm.searchService = searchService
    //
    //   function onInit() {
    //     searchService.getCharacters().then(function (response) {
    //       vm.characters = response.data
    //       console.log(vm.characters);
    //     })
    //   }
    // }
}());
