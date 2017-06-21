angular.module('justWrite.editor')

        .factory('editorServices', ['$http',
            function ($http) {

            var dirty = {
                data: []
            };

            var commits = {
                data: []
            };

            var services = {
                saveDirtyChanges: function (changes) {
                    console.log("Saving dirty...");
                    dirty.data.push(changes);
                    return Promise.resolve(changes);
                },

                getDirtyChanges: function () {
                    return Promise.resolve(dirty);
                },

                commitChanges: function(name, changes) {
                    var commit = {
                        name: name,
                        timestamp: Date.now(),
                        changes: changes
                    };

                    commits.data.push(commit);
                    return Promise.resolve(commit);
                },

                getCommits: function() {
                    return Promise.resolve(commits);
                }
            };

            return services;
        }]);
