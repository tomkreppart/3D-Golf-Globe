(function() {
  'use strict';

  angular.module('app').config(config)

  config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider']

   function config($stateProvider, $urlRouterProvider, $locationProvider){

     $locationProvider.html5Mode(true)

     $stateProvider
       .state({ name: 'globe', url: '/', component: 'globe' })
       .state({ name: 'courses', url: '/courses', component: 'courses' })
   }
}());
