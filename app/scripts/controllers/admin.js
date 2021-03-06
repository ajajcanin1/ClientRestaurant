'use strict';

angular.module('restaurantclientApp')
  .controller('AdminCtrl', function ($scope, $rootScope) {
    $rootScope.show = false;
    $scope.btnValue = ['restaurants', 'locations', 'categories', 'users'];


    $scope.addNewElement = function(tab){
      console.log(tab);
      $scope.activeTab = tab;
      $rootScope.show = false;
      $rootScope.edit=false;
    };

  })
  .controller('AdminDashboardCtrl', function ($scope, AdminService) {
    AdminService.getCounters().then(function (res){
      $scope.counter = res.data;
    });

  })
  .controller('AdminRestaurantsCtrl', function ($scope, RestaurantService, $rootScope, FireService, LocationService, CousineService, AdminService){
    $scope.imageSrc = {
      profile : null,
      cover : null
    };
    $scope.restaurantInfo = {
      id: '',
      restaurantName: '',
      description: '',
      latitude: '',
      longitude: '',
      priceRange: '',
      imageFileName: '',
      coverFileName: '',
      foodType: '',
      'city': ''
    };
    $rootScope.show = true;
    $scope.notEmpty = false;
    $scope.currentPage= 1;
    $scope.gmap = {
      pos : [43.8563, 18.4131],
      center : [43.8563, 18.4131]
    };
    LocationService.getCountries().then(function (res) {
      var json = res.data;
      json.unshift({country : 'Country', disabled : true});
      $scope.countries = json;
    });
    $scope.updateCities = function(){
      var body = {
        countryId : $scope.restaurantInfo.country
      };
      LocationService.getCities(body).then(function (res) {
        var json = res.data;
        //json.unshift({country : 'City', disabled : true});
        $scope.cities = json;
      });
    };
    CousineService.getAllCousines().then(function(res){
      $scope.cousines = res.data;
      //$scope.cousines = json.map(obj => obj.name.toString());
    });
    $scope.activeCategories=[];
    $scope.foodType=[];
    $scope.addCategory=function(id){
      var temp = $scope.cousines.find(obj => obj.id === id);
      console.log(id);
      if($scope.activeCategories.map(obj => obj.id).indexOf(id) === -1){
        $scope.activeCategories.push(temp);
        $scope.foodType.push(id);
      }
      console.log($scope.foodType);
    };
    $scope.deleteActiveCategory=function(index){
        $scope.activeCategories.splice(index,1);
        $scope.foodType.splice(index,1);
    };
    $scope.searchRestaurants = function(){
     var data = {
      itemsPerPage : 9,
      pageNumber : $scope.currentPage,
      searchText : '', //scope.search!
      filterPrice : '',
      filterRating : '',
      filterCousine : '',
      date: '',
      time: '',
      guests: ''
     };
     RestaurantService.getSearchedRestaurants(data).then(function(res){
      var json = res.data.restaurants;
      var numPages = res.data.numberOfRestaurantPages;
      if(!Object.keys(json).length){
        $scope.notEmpty = false;
      } else {
        $scope.notEmpty = true;
        $scope.restaurants = json;
        $scope.numPerPage = 9;
        $scope.numPages = numPages;
        $scope.totalItems = res.data.totalItems;
        $scope.maxSize = 5;
      }
    });
    };
    $scope.searchRestaurants();


    $scope.pageChanged = function() {
      $scope.searchRestaurants();
    };

    $scope.dragEnd = function (){
      $scope.gmap.pos = [$scope.map.getCenter().lat(),$scope.map.getCenter().lng()];
      $scope.restaurantInfo.latitude=$scope.map.getCenter().lat();
      $scope.restaurantInfo.longitude=$scope.map.getCenter().lng();
    };

    $scope.edit = function(restaurant){
      RestaurantService.getExtraDetails(restaurant.id).then(function(res){
        console.log('test');
        res=res.data;
        $scope.restaurantInfo = restaurant;
        $scope.imageSrc.profile = restaurant.imageFileName;
        $scope.imageSrc.cover = restaurant.coverFileName;
        $scope.restaurantInfo.priceRange = restaurant.priceRange;
        $scope.gmap.pos = [res.longitude, res.latitude];
        $scope.restaurantInfo.description = res.description;
        $scope.restaurantInfo.country = res.city.country.id;
        $scope.updateCities();
        $scope.restaurantInfo.city = res.city.id;
        $scope.activeCategories=res.cousines;
        $scope.foodType=res.cousines.map(obj => obj.id);
        $rootScope.edit=true;
      });
      console.log('hhhhhhh'+restaurant);
    };
    $scope.addRestaurant = function(){
      FireService.uploadImage($scope.imageSrc.profile, function(profileUrl){
        $scope.restaurantInfo.imageFileName=profileUrl;
        FireService.uploadImage($scope.imageSrc.cover, function (coverUrl) {
          $scope.restaurantInfo.coverFileName=coverUrl;
          var data = {
            id : $scope.restaurantInfo.id,
            name : $scope.restaurantInfo.restaurantName,
            priceRange :$scope.restaurantInfo.priceRange,
            description : $scope.restaurantInfo.description,
            avatar:$scope.restaurantInfo.imageFileName,
            cover:$scope.restaurantInfo.coverFileName,
            longitude:$scope.restaurantInfo.longitude,
            latitude:$scope.restaurantInfo.latitude,
            cityId : $scope.restaurantInfo.city,
            cousines: $scope.restaurantInfo.foodType,
          };
          if($rootScope.edit){
            AdminService.editRestaurant(data).then(function(res){
              $rootScope.show = true;
            });
          } else {
            AdminService.addRestaurant(data).then(function(res){
              $rootScope.show = true;
            });
          }
        });
      });
    };
  })

  .controller('AdminLocationCtrl', function ($scope, $rootScope, LocationService, AdminService) {
    $scope.currentPage= 1;
    $rootScope.show = true;
    $scope.location={
      id: '',
      city: '',
      country: ''
    };

    $scope.searchLocations = function(){
      var data = {
        itemsPerPage : 9,
        pageNumber : $scope.currentPage,
        searchText : '', //scope.search!
      };

      console.log('Lokacije1001');
      LocationService.getCitiesPagination(data).then(function(res){
        console.log('Lokacije100');
        var json = res.data.locations;
        console.log('Lokacije' + json);
        var numPages = res.data.numberOfRestaurantPages;
        if(!Object.keys(json).length){
          $scope.notEmpty = false;
        } else {
          $scope.notEmpty = true;
          $scope.cities = json;
          $scope.numPerPage = 9;
          $scope.numPages = numPages;
          $scope.totalItems = res.data.totalItems;
          $scope.maxSize = 5;
        }
      });
    };
    $scope.searchLocations();

    $scope.pageChanged = function() {
      $scope.searchLocations();
    };

    $scope.edit = function(location) {
      $scope.location.city = location.city;
      $scope.location.country = location.country;
      $rootScope.edit = true;
    };
    $scope.addLocation = function(){
      var data = {
        id : $scope.location.id,
        city : $scope.location.city,
        country : {
          country : $scope.location.country
        }
      };
      if($rootScope.edit){
        AdminService.editLocation(data).then(function(res){
          $rootScope.show = true;
        });
      } else {
        AdminService.addLocation(data).then(function(res){
          $rootScope.show = true;
        });
      }
    };
  })
  .controller('AdminCategoriesCtrl', function ($scope, $rootScope, CousineService, AdminService) {
    $scope.currentPage = 1;
    $rootScope.show = false;
    $scope.cousine={
      id: '',
      name: ''
    };

    $scope.searchCategories = function(){
      var data = {
        itemsPerPage : 9,
        pageNumber : $scope.currentPage,
        searchText : '', //scope.search!
      };

      CousineService.getCousinePagination(data).then(function(res){
        var json = res.data.cousines;
        console.log(json);
        var numPages = res.data.numberOfRestaurantPages;
        if(!Object.keys(json).length){
          $scope.notEmpty = false;
        } else {
          $scope.notEmpty = true;
          $scope.categories = json;
          $scope.numPerPage = 9;
          $scope.numPages = numPages;
          $scope.totalItems = res.data.totalItems;
          $scope.maxSize = 5;
        }
      });
    };
    $scope.searchCategories();
    $scope.pageChanged = function() {
      $scope.searchCategories();
    };

    $scope.edit = function(cousine) {
      $scope.cousine.name = cousine.name;
      $rootScope.edit = true;
    };
    $scope.addCategory = function(){
      var data = {
        name : $scope.cousine.name
      };
      if($rootScope.edit){
        AdminService.editCategory(data).then(function(res){
          $rootScope.show = true;
        });
      } else {
        AdminService.addCategory(data).then(function(res){
          $rootScope.show = true;
        });
      }
    };
  })
  .controller('AdminUsersCtrl', function ($scope, $rootScope, AdminService, LocationService) {
    LocationService.getCountries().then(function (res) {
      var json = res.data;
      json.unshift({country : 'Country', disabled : true});
      $scope.countries = json;
    });
    $scope.updateCities = function(){
      var body = {
        countryId : $scope.info.country
      };
      LocationService.getCities(body).then(function (res) {
        var json = res.data;
        //json.unshift({country : 'City', disabled : true});
        $scope.cities = json;
      });
    };
    $scope.currentPage = 1;
    $scope.users = [];
    $rootScope.show = false;
    $scope.info = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      type: ''
    };
//DODATI PASSWORD ?
    $scope.searchUsers = function(){
      var data = {
        itemsPerPage : 9,
        pageNumber : $scope.currentPage,
        searchText : '', //scope.search!
      };

      AdminService.getUserPagination(data).then(function(res){
        var json = res.data.users;
        console.log(json);
        var numPages = res.data.numberOfRestaurantPages;
        if(!Object.keys(json).length){
          $scope.notEmpty = false;
        } else {
          $scope.notEmpty = true;
          $scope.users = json;
          $scope.numPerPage = 9;
          $scope.numPages = numPages;
          $scope.totalItems = res.data.totalItems;
          $scope.maxSize = 5;
        }
      });
    };
    $scope.searchUsers();
    $scope.pageChanged = function() {
      $scope.searchCategories();
    };

    $scope.edit = function(user) {
      console.log(user);
      $scope.info = {
        first: user.firstName,
        last: user.lastName,
        email: user.email,
        phone: user.phone,
      };
      $scope.info.country = 1;
      $scope.updateCities();
      $scope.info.city=2;
      $rootScope.edit = true;
    };

    $scope.addUser = function(){
      var userType = '';
      if($scope.userType){userType='admin';}
      else {userType='user';}
      var data = {
        firstName: $scope.info.firstName,
        lastName: $scope.info.lastName,
        email: $scope.info.email,
        pass: $scope.info.pass,
        phone: $scope.info.phone,
        userType: userType,
        cityId : $scope.info.city
      };
      if($rootScope.edit){
        AdminService.editUser(data).then(function(res){
          $rootScope.show = true;
        });
      } else {
        AdminService.addUser(data).then(function(res){
          $rootScope.show = true;
        });
      }
    };
  });
