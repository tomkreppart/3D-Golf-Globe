(function() {
  'use strict'

  angular.module('app')
    .service('searchService', SearchService)

    SearchService.$inject = ['$http']

    function SearchService($http) {
      // this.search = ""
      //
      // this.getAllCourses = () => {
      //   return $http.get('https://rick-and-morty-quotes.herokuapp.com/api/characters')
      // }
      //
      // this.getOneCourse = (id) => {
      //   return $http.get('https://rick-and-morty-quotes.herokuapp.com/api/characters/' + id)
      // }
    }
}());
