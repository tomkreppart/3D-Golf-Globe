(function() {
  'use strict'

  angular.module('app')
    .service('searchService', SearchService)

    SearchService.$inject = ['$http']

    function SearchService($http) {
      this.search = ""

      this.getAllCourses = () => {
        return $http.get('https://golf-globe-3d.herokuapp.com/api/courses')
      }
      
      this.getOneCourse = (id) => {
        return $http.get('https://golf-globe-3d.herokuapp.com/api/courses/' + id)
      }
    }
}());
