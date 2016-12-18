var configModule = angular.module('app', ['ngResource', 'ui.bootstrap']);

configModule.controller('ConfigCtrl', function ($scope, $resource, $uibModal) {

    $scope.config = {};
    $scope.isDirty = true;
    $scope.isValid = true;
    
    $resource('/admin/adapter/config').get(function(configuration){
        $scope.config = configuration;         
    }, function(err) {
        alert('Can not load configuration: ' + JSON.stringify(err));
    });

    $scope.saveItems = function() {
        confirmationDialog($uibModal, 'sm', 'Save Items', 'Save current item configuration?' , function(ok) {
            if(ok) {
                $resource('/admin/adapter/config').save($scope.config, function(configuration){
                    alert('Configuration successfully saved!');    
                }, function(err) {
                    alert('Can not save configuration: ' + err);
                });
            }
        })
    };

    $scope.createNewItem = function() {
        if (!('items' in $scope.config)) {
            $scope.config['items'] = {};
        }
        $scope.config.items[generateUUID()] = {};
    };

    $scope.deleteItem = function(id,name) {
        confirmationDialog($uibModal, 'sm', 'Delete Item', 'Delete "' + name + '" (' + id + ')?' , function(ok) {
            if(ok) {
                delete $scope.config.items[id];
            }
        })
    }
});

// Modal Dialog
function confirmationDialog($uibModal, size, title, message, callback) {
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'yesno.html',
            controller: 'ConfirmationController',
            controllerAs: '$ctrl',
            size: size,
            resolve: {
                title: function () {
                    return title;
                },
                message: function () {
                    return message;
                }
            }
        });

        modalInstance.result.then(function (result) {
          callback(true);
        }, function () {
          callback(false);
        });
    };

configModule.controller('ConfirmationController', function ($uibModalInstance, title, message) {
    var $ctrl = this;
    $ctrl.title = title;
    $ctrl.message = message;
    $ctrl.ok = function () {
        $uibModalInstance.close('result');
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

// UUID generator (see http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript)
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}