'use strict';

angular.module('justWrite.editor')

    .controller('EditorController', ['editorServices', '$interval', function (editorServices, $interval) {

        var previousDelta;

        var quillModules = {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline']
                ],
                history: {
                    delay: 2000,  //All changes within 2 seconds are merges into 1
                    maxStack: 500, //Max stack of changes to record.
                    userOnly: true
                }
            };

        var quillOptions = {
            modules: quillModules,
            placeholder: 'Just write...',
            theme: 'snow'
        };

        var quill = new Quill('.editor', quillOptions);
        var Delta = Quill.import('delta');

        var changes = new Delta();

        quill.on('text-change', onTextChange );

        function onTextChange (delta, oldDelta, source) {
            if (source == 'user') changes = changes.compose(delta);
        }

        function saveChanges () {
            editorServices.saveChanges(changes)
            .then(function(result){
                changes = new Delta();
            })
        }

        $interval(saveChanges, 5*1000);
    
    }])
