angular.module('justWrite.editor')

        .factory('editorServices', ['$http', '_',
            function ($http, _) {

            var lastCommitId = -1;
            var lastScrapId = -1;

            var dirty = {
                data: []
            };

            var commits = {
                data: []
            };

            var scraps = {
                data: []
            }

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
                    lastCommitId += 1;
                    var commit = {
                        _id: lastCommitId,
                        name: name,
                        timestamp: Date.now(),
                        changes: changes
                    };

                    commits.data.push(commit);
                    return Promise.resolve(commit);
                },

                getCommits: function() {
                    return Promise.resolve(commits);
                },

                getCommit: function(commitId) {
                    return Promise.resolve(commits.data[commitId]);
                },

                newScrap: function (scrap, tags) {
                    lastScrapId += 1;
                    scrap._id = lastScrapId;
                    scrap.timestamp = Date.now();
                    scrap.tags = tags;

                    scraps.data.push(scrap)
                    return Promise.resolve(scrap);
                },

                getScrap: function (scrapId) {
                    return Promise.resolve(scraps.data[scrapId]);
                },

                getScraps: function () {
                    return Promise.resolve(scraps);
                },

                getScrapsWithTags: function(tags){

                    var resScrap = _.filter(scraps.data, function(s){
                        return _.intersection(s.tags, tags).length > 0;
                    })

                    return Promise.resolve(resScrap);
                }
            };

            return services;
        }]);
