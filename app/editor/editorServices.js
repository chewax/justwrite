angular.module('justWrite.editor')

        .factory('editorServices', ['$http',
            function ($http) {

            var services = {
                saveChanges: function (changes) {
                    console.log("saving...");
                    console.log(changes);
                    return Promise.resolve(null);
                }
            };

            return services;
        }]);
