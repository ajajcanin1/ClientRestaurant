'use strict';

/**
 * @ngdoc overview
 * @name restaurantclientApp
 * @description
 * # restaurantclientApp
 *
 * Main module of the application.
 */
var app = angular
  .module('restaurantclientApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-jwt',
    'ui.bootstrap',
    'ngMap',
    'ngMaterial',
    'ui.carousel'
  ]);
app.config(function ($locationProvider) {
  $locationProvider.hashPrefix('');
  //$locationProvider.html5Mode(true);
});
app.config(function ($httpProvider, jwtOptionsProvider){
  $httpProvider.interceptors.push('jwtInterceptor');
  jwtOptionsProvider.config({
    whiteListedDomains: ['http://localhost:8080/', 'localhost', 'https://ajdinsrestaurantsapp.herokuapp.com/'],
    tokenGetter: ['options', function(options){
      if(options && options.url.substr(options.url.length-5) === '.html') {return null;}
      return window.localStorage.getItem('token');
    }]
  });

  var config = {
    apiKey: 'AIzaSyDwQgbcwVYhXYBbXtsDsfhTRCMOTVKeO1I',
    authDomain: 'restaurantreservation-2c-cc397.firebaseapp.com',
    databaseURL: 'https://restaurantreservation-2c-cc397.firebaseio.com',
    projectId: 'restaurantreservation-2ce49',
    storageBucket: 'restaurantreservation-2ce49.appspot.com',
    messagingSenderId: '430376921913'
  };
  firebase.initializeApp(config);
});
app
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'login'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        controllerAs: 'register',
      })
      .when('/search/', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'search'
      })
      .when('/search/:value?/guests/:guests?/date/:date?/time/:time?', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'search'
      })
      .when('/restaurant', {
      templateUrl: 'views/restaurant.html',
      controller: 'RestaurantCtrl',
      controllerAs: 'restaurant'
      })
      .when('/reservation', {
        templateUrl: 'views/reservation.html',
        controller: 'RestaurantCtrl',
        controllerAs: 'reservation',
        date:{
          authorization:true,
          redirectTo: 'login',
        }
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
app.run(function ($rootScope, $location, $http, $window, authManager){
  var userData = $window.localStorage.getItem('token');
  authManager.checkAuthOnRefresh();
  /*console.log('token  = ' + userData);
  if (userData) {
    $http.defaults.headers.common.Authorization = userData;
  }*/
  $rootScope
    .$on('$locationChangeStart', function (event, next, current) {
      console.log('token  = ');
      var restrictedPage
        = $location.path().indexOf('/login') === -1;
      var loggedIn
        = $window.localStorage.getItem('token');
      var reservationPage = $location.path().indexOf('/reservation')!==-1;
      console.log('loggedIn:  = ' + loggedIn) ;
      console.log('reservationPage' + reservationPage);
      if (restrictedPage && !loggedIn && reservationPage) {
        $location.path('/login');
      }
    });
});
