'use strict';



glados.controller("GladosController", function ($scope, $timeout, $http, $log,
                                                $mdDialog, $mdMedia, $mdEditDialog, $q){

    $scope.add = 0;
    $scope.unsorted = [];
    $scope.filterDevice = [];
    $scope.filterUser = [];
    $scope.filterAvail = [];
    $scope.filterPower = [];
    $scope.progress = 0;
    $scope.unchanged = '';
    $scope.continue = 0;
    $scope.addData = {
        rack: "",
        ip: "",
        port: "",
        device: "",
        user: "",
        power: "",
        testbed: "",
        date: "", 
    };
    
    $scope.send_testbed = {
        _id: "",
        user: "",
        devices: []
    };

    $scope.testbeds = [];

    $scope.selectedTab = 0;

    $scope.power = 0;

    $scope.filters = ['Devices', 'Users', 'Availability', 'Power Status'];

    $scope.devices = ['3200', '3400', '3600', '620', '650', '7005', 
                      '7010', '7024', '7030', '7205', '7210', '7220',
                      '7240', 'Extreme-X440-48T-10G', 'M3',
                      'S1500-12P', 'S1500-24P', 'S1500-48P',
                      'S2500-24P', 'S2500-48P',
                      'S3500-24P', 'S3500-48P', 'S3500-48T', 'Tyrone'];

    $scope.users = ['Abhinesh', 'Abhisek', 'Amit', 'Arpit', 'Ashok',
                    'Gopal', 'Himanshu', 'Kishore', 'Muthiah', 'Nisarga',
                    'Nitin', 'Pradip', 'Ramas', 'Sadashiv', 'Unni'];


/*  For filtering users and devices */  
    function filter (item, list) {
        if (list.length == 0)
            return true;
        if (list.indexOf(item) > -1)
            return true;
        else 
            return false; 
    }  

    function getDisplayData () {
        $scope.displayData = [];
        for (var i = 0; i < $scope.unsorted.length; i++) {
            if (filter($scope.unsorted[i].device, $scope.filterDevice) &&
                filter($scope.unsorted[i].user, $scope.filterUser) &&
                filter($scope.unsorted[i].power, $scope.filterPower)) {
                $scope.displayData.push($scope.unsorted[i]);
            }
        }
    }

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
        getDisplayData();
    };


    $scope.alerts = function(e) {
    };

/* Handle tabs and their data segregation */
    var tabs = [{ title: 'Rack 2' , id: 'rack2', console: '10.16.78.43', gateway: "10.16.82.129", ip: "10.16.82.130"}, 
		{ title: 'Rack 6' , id: 'rack6', console: '10.16.77.2', gateway: "10.16.77.1" , ip: "10.16.77.5"}, 
        { title: 'Rack 7' , id: 'rack7', console: '10.16.77.66', gateway: "10.16.77.65", ip: "10.16.77.69"}, 
        { title: 'Rack 8' , id: 'rack8', console: '10.16.77.194', gateway: "10.16.81.1", ip: "10.16.81.2"},
		{ title: 'Rack 9' , id: 'rack9', console: '10.16.77.210', gateway: "10.16.81.65", ip: "10.16.81.68"}, 
        { title: 'Rack 10' , id: 'rack10', console: '10.16.77.226', gateway: "10.16.81.129", ip: "10.16.81.130"}, 
        { title: 'Testbed', id: 'testbed', console: null, gateway: null, ip: null }],
		selected = null,
        previous = null;
    $scope.tabs = tabs;
    
    
    $scope.getData = function (i) {
        $scope.unsorted = [];
        $scope.displayData = [];
        if ($scope.selectedTab != 6) {
            $scope.getTab = tabs[i].title;
            $http.get('/get_data/', {params: {'tab': $scope.getTab}}).success(function(data){
                    $scope.unsorted = data.device;
                    $scope.testbeds = data.testbed;
                    getDisplayData();
            })
            .error(function(data) {
                alert("This is an error");
            })
            ;  
        } else {
            $http.get('/get_testbed/').success(function(data) {
                $scope.testbeds = data.testbed;
            });
        } 
    	//alert("This rack is: " + tabs[i].id);
    };

    $scope.selected = [];

/* Get the data initially */
    $scope.getData($scope.selectedTab);

    function getIpFromConsole(port) {
        if (port < 7001) {
            alert("Invalid port addition");
        } else {
            var spl = tabs[$scope.selectedTab].ip.split(".");
            spl[3] = "" + (parseInt(spl[3]) + port - 7001);
            return spl.join(".");

        }

    }

/* Dialog for adding/updating boxes */
    
    $scope.dialogBox = function (ev, send_data) {
    $mdDialog.show({
      controller: function addDialog($scope, add, devices, users, testbeds, data, db_devices) {
        var length = 0;
        $scope.add = add;
        $scope.errors = 0;

        $scope.tmpdata = data;

        $scope.devices = devices;
        $scope.users = users;
        $scope.testbeds = testbeds;

        $scope.closeDialog = function() {
            $scope.tmpdata =  send_data;
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
          if (add == 1) {
            if ((answer.port == "") || (answer.device == "") ||
                (("" + answer.port).length > 4) || (parseInt(answer.port) < 7001)
                ) {
                $scope.errors = 1;
                $scope.error_message = "Errors in the mandataory fields. Please check.";
            } else {
            /* Check if user is doing duplication */
                if (db_devices.findIndex(function(x) { return x.port == answer.port }) > -1) {
                    $scope.errors = 1;
                    $scope.error_message = "This port is already used by another device.";
                } else {
                    $scope.tmpdata = [];
                    $mdDialog.hide(answer);
                }
            }
          } else {
            $scope.tmpdata = {};
            $mdDialog.hide(answer);
          }
        };

      } 
      ,
      templateUrl: '/dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        add: $scope.add,  
        devices: $scope.devices,
        users: $scope.users,
        testbeds: $scope.testbeds,
        data: angular.copy(send_data),
        db_devices: $scope.unsorted
      }
    })
        .then(function(answer) {
            $scope.add_data = answer;
            if ($scope.add == 1) {
                $scope.add_data.ip = getIpFromConsole($scope.add_data.port);
                if ($scope.add_data.testbed != "") {
                    var id = $scope.testbeds.findIndex(function(x) { return x._id == $scope.add_data.testbed });
                    $scope.add_data.user =  $scope.testbeds[id].user; 
                }
                $http.post('/add_data', $scope.add_data)
                .then(function(data){
                    if (data.data.device != undefined) {
                        $scope.unsorted.push(data.data.device);
                        $scope.testbeds = data.data.testbed;
                        getDisplayData(); 
                    }
                })
                .catch(function(data) {
                    $scope.showAlert(ev, data.data, "");
                });
            } else {
                if ($scope.add_data.testbed != "") {
                    var id = $scope.testbeds.findIndex(function(x) { return x._id == $scope.add_data.testbed });
                    $scope.add_data.user =  $scope.testbeds[id].user; 
                }
                $http.post('/update_data', $scope.add_data)
                .then(function(data){
                    if(data.data.device != undefined) {
                        var idx = $scope.unsorted.findIndex(function(x) { return x._id == data.data.device._id });
                        $scope.unsorted[idx] = data.data.device;
                        $scope.testbeds = data.data.testbed;
                        getDisplayData();
                    } 
                })
                .catch(function(data) {
                    var idx = $scope.unsorted.findIndex(function(x) { return x._id == $scope.add_data._id });
                    if (idx > -1) $scope.unsorted[idx].user = data.data.user;
                    getDisplayData();
                    $scope.showAlert(ev, data.data.line, "");
                });
            }
        });
  };


/* Dialog for deleting boxes */
   $scope.dialogDeleteBox = function(ev, data, stuff, code) {
       var text, title, route, params;
       if (code == 1) {
            title = "Are you sure you want to delete the box?";
            text = "This will also delete the box from any testbed if it is in.";
       } 
       if (code == 2) {
            title = "Are you sure you want to remove the box from testbed?";
            text = "";
       }
       if (code == 3) {
            title = "Are you sure you want to remove this testbed?";
            text = "";
       }
       var confirm = $mdDialog.confirm()
            .title(title)
            .textContent(text)
            .ariaLabel('Delete Box')
            .targetEvent(ev)
            .ok("Do it!")
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            if (code == 1) {
                route = '/delete_data/';
                params = {
                    'id': data._id,
                    'testbed': data.testbed
                }
            }
            if (code == 2) {
                route = '/delete_fromTestbed/';
                params = {
                    'testbed': data,
                    'device': stuff
                }
            }
            if (code == 3) {
                route = '/delete_testbed/';
                params = {
                    'testbed': data
                }
            }
            $http.get(route, {params: params}).success(function(result){
                var idx = $scope.unsorted.findIndex(function(x) { return x._id == data._id });
                if (idx > -1) $scope.unsorted.splice(idx, 1);
                $scope.testbeds = result.testbed;
                getDisplayData();
            }); 
        })
   };

   $scope.dialogAddTestbed = function (ev, send_data) {
    $mdDialog.show({
      controller: function addDialog($scope, users, db_testbeds) {
        var length = 0;
        $scope.errors = 1;
        $scope.tmpdata = {
            name: "",
            user: "",
        };

        $scope.users = users;

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(data) {
          if (data.name == "" || data.user == "" || typeof(data.name) == 'undefined') {
            $scope.errors = 1;
            $scope.error_message = "Mandatory Fields can't be empty";
          } else {
            if (typeof(db_testbeds) != 'undefined') {
                var idx = db_testbeds.findIndex(function(x) { return x.name == data.name });
                if (idx > -1) {
                    $scope.errors = 1;
                    $scope.error_message =  "Testbed name already in use. Innovate something else";
                } else {
                    $mdDialog.hide(data);
                } 
            } else {
                $mdDialog.hide(data);
            }
          }
        };

      } 
      ,
      templateUrl: '/testbed.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        users: $scope.users,
        db_testbeds: $scope.testbeds,
      }
    })
        .then(function(answer) {
            $scope.send_testbed._id = answer.name;
            $scope.send_testbed.user = answer.user;
            $http.post('/add_testbed', $scope.send_testbed).success(function(data){
                $scope.testbeds.push(data.testbed);
            }); 
        });
  };


   $scope.showAlert = function(ev, title, text) {
    if (title == "") {
        title = "Something wrong happened";
    }
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .clickOutsideToClose(true)
        .title(title)
        .textContent(text)
        .ariaLabel('Alert Dialog')
        .ok('Got it!')
        .targetEvent(ev)
    );
  };

 /* Adding box to a rack */

   $scope.addBox = function(ev) {
        if ($scope.selectedTab == 6) {
            $scope.addTestbed(ev);
        } else {
            $scope.add = 1;
            $scope.addData.rack = $scope.tabs[$scope.selectedTab].title;
            $scope.addData.power = 1;
            $scope.addData.date = new Date().getDay();
            $scope.dialogBox(ev, $scope.addData);
        }
   };

   $scope.add = function(ev) {
        if ($scope.selectedTab == 6) {
            $scope.addTestbed(ev);
        }
        else {
            $scope.addBox(ev);
        }
   };

   

 /* Updating box in a rack */

    $scope.updateBox = function (data, ev) {
      if (data.permanent == 1) {
        $scope.showAlert(ev, "Permanent Box Alert", "This is a permanent box. You cannot update this!");
      } else { 
        $scope.add = 0;
        var idx = $scope.unsorted.findIndex(function(x) { return x._id == data._id });
        if (idx == -1) {
            $scope.showAlert(ev, "Something wrong happened", "");
        } else {
            $scope.addData = $scope.unsorted[idx];
            $scope.addData.date = new Date().getDay();
            $scope.dialogBox(ev, $scope.addData);
        }
      }
    };

    $scope.deleteBox = function (data, ev) {
      if (data.permanent == 1) {
        $scope.showAlert(ev, "Permanent Box Alert", "This is a permanent box. You cannot delete this!");
      } else {
        $scope.add = 0;
        $scope.dialogDeleteBox(ev, data, null, 1);
      }
    };

    $scope.addTestbed = function(ev) {
        $scope.dialogAddTestbed(ev);
    };

    $scope.deleteFromTestbed = function (ev, testbed, device) {
        $scope.dialogDeleteBox(ev, testbed, device, 2);
    };

     $scope.deleteTestbed = function (ev, testbed) {
        $scope.dialogDeleteBox(ev, testbed, null, 3);
    };

  $scope.options = {
    autoSelect: false,
    boundaryLinks: false,
    largeEditDialog: false,
    pageSelector: false,
    rowSelection: false
  };
  
  $scope.query = {
    order: 'port',
    page: 1
  };

});

  

