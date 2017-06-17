angular.module('justWrite.editor')

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/editor', {
            templateUrl: 'editor/editorView.html',
            controller: 'EditorController'
        });
    }])

