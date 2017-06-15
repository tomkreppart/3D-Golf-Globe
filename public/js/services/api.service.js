(function() {
  'use strict'

  angular.module('app')
    .service('searchService', SearchService)

    SearchService.$inject = ['$http', '$rootScope']

    function SearchService($http, $rootScope) {
      this.search = ""

      this.getAllCourses = () => {
        return $http.get('https://golf-globe-3d.herokuapp.com/api/courses')
      }

      this.getOneCourse = (id) => {
        return $http.get('https://golf-globe-3d.herokuapp.com/api/courses/' + id)
      }
      this.setCourse = (course) => {
        Object.assign(this.currentCourse, course)
        $rootScope.$apply()
        // this.currentCourse.name = course.name
      }
      this.currentCourse = {}
    }
}());
