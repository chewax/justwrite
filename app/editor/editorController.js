'use strict';

angular.module('justWrite.editor')

    .controller('EditorController', ['editorServices', '$interval', '$window', function (editorServices, $interval, $window) {

        var previousDelta;

        var quillModules = {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline']
                ],
                history: {
                    delay: 1000,  //All changes within 2 seconds are merges into 1
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

        // var changes = new Delta();
        // var isDirty = false;

        var editor = {
            changes: new Delta(),
            isDirty: false
        };
    
        quill.on('text-change', onTextChange );

        function onTextChange (delta, oldDelta, source) {
            if (source == 'user') {
                editor.changes = editor.changes.compose(delta);
                editor.isDirty = true;
            }
        }


        /**
         * Saves dirty changes. 
         * These changes will be reset upon commit.
         */
        function saveDirtyChanges () {
            if (!editor.isDirty) return Promise.resolve(true);

            return editorServices.saveDirtyChanges(editor.changes)
            .then(function(result){
                editor.isDirty = false;
                editor.changes = new Delta();
            })
        }

        var ctrlDown = false;
        var shiftDown = false;

        var ctrlKey = 17;
        var shiftKey = 16;
        var commandKey = 91;
        var sKey = 83;
        var zKey = 90;

        angular.element($window).bind("keyup", function($event) {
            if ($event.keyCode == ctrlKey || $event.keyCode == commandKey) ctrlDown = false;
            if ($event.keyCode == shiftKey) shiftDown = false;
        });

        angular.element($window).bind("keydown", function($event) {
            if ($event.keyCode == ctrlKey || $event.keyCode == commandKey) ctrlDown = true;
            if ($event.keyCode == shiftKey) shiftDown = true;

            if (ctrlDown && !shiftDown) {    
                
                if ($event.keyCode == zKey) {
                    undo ();
                }

                if ($event.keyCode == sKey) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    commitVersion ();
                }
            }

            if (ctrlDown && shiftDown) {    
                
                if ($event.keyCode == zKey) {
                    redo ();
                }
                
                if ($event.keyCode == sKey) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    forkVersion();
                }
            }

        });

        function undo () {
            quill.history.undo();
        }
        
        function redo () {
            quill.history.redo();
        }
        
        function commitVersion () {    
            //TODO Ask for commit name
            var commitName = "TestName";

            // If there are dirty changes on editor, save dirty and then commit
            saveDirtyChanges()
            .then(function(result){
                //Get all dirty changes from API
                return editorServices.getDirtyChanges()
            })
            .then(function(result){
                //Compile all dirty changes
                var dirty =  result.data;
                var commitData = new Delta();
                dirty.forEach(function(dirtyChange){
                    commitData = commitData.compose(dirtyChange);
                })

                //Commit compiled changes
                return editorServices.commitChanges(commitName, commitData);     
            })
            .then(function(result){
                console.log("Commit saved...");
            })
            .catch(function(err){
                console.log(err);
            })
            
        }

        function forkVersion () {
            alert("fork name?");
            console.log("Forking version...");
        }

        $interval(saveDirtyChanges, 5*1000);
    
    }])
