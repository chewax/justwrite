'use strict';

angular.module('justWrite.editor')

    .controller('EditorController', ['editorServices', 'keypress', '$interval', '$window', '$scope', '$timeout',
    function (editorServices, keypress, $interval, $window, $scope, $timeout) {

        
        $scope.commits = [];
        $scope.scraps = [];
        $scope.loadCommit = loadCommit;
        $scope.scrapOnMouseOver = scrapOnMouseOver;
        $scope.scrapOnMouseLeave = scrapOnMouseLeave;
        $scope.loadScrap = loadScrap;

        var scrapTooltipIsShown = false;
        var tooltipTimeoutPromise = {};

        //Keypress Listener =================
        var listener = new keypress.Listener();
        listener.simple_combo("meta s", commitVersion );
        listener.simple_combo("shift meta s", branchVersion );
        listener.simple_combo("meta z", undo );
        listener.simple_combo("shift meta z", redo );
        listener.simple_combo("shift meta x", newScrap );
        //===================================================


        //Context Menu Definition ===========================
        $scope.ctxMenuOptions = [
            {
                text:"Create scrap",
                onClick: OptOneClick
            },
            {
                text:"Commit version",
                onClick: OptOneClick
            },
            {
                text:"Branch version",
                onClick: OptOneClick
            },
            {
                text:"Undo",
                onClick: OptOneClick
            },
            {
                text:"Redo",
                onClick: OptOneClick
            },
        ]

        function OptOneClick() {
            console.log("option clicked");
        }

        //===================================================

        var previousDelta;
        //TODO load from user config
        var saveDirtyInterval = 5 * 1000;

        var toolbarOptions = [

            [{ 'font': [] }],
            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic'   , 'underline', 'strike'],        // toggled buttons
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            
            // ['blockquote', 'code-block'],
            // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            // [{ 'direction': 'rtl' }],                         // text direction

            // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            

            // ['clean']                                         // remove formatting button
        ];

        var quillModules = {
                toolbar: toolbarOptions,
                history: {
                    delay: 1000,  //All changes within 2 seconds are merges into 1
                    maxStack: 500, //Max stack of changes to record.
                    userOnly: false
                }
            };

        var quillOptions = {
            modules: quillModules,
            placeholder: 'Just write...',
            theme: 'snow'
        };

        var quill = new Quill('.writebox-editor', quillOptions);
        var Delta = Quill.import('delta');

        var editor = {
            changes: new Delta(),
            isDirty: false
        };
        
        //REMOVE THIS ON PRODUCTION....JUST FOR TESTING
        quill.insertText(0, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus convallis congue elit sed interdum.' + 
        'Suspendisse sit amet magna ut nisl vulputate egestas. Quisque placerat leo risus, tempus porta lectus pretium at. Vestibulum rutrum felis odio, ' +
        'nec hendrerit lorem tempus sed. Aenean malesuada diam ac condimentum consectetur. Nulla consequat libero elementum venenatis sollicitudin. ' + 
        'Curabitur et scelerisque justo. Praesent id dolor scelerisque, varius odio non, tincidunt lectus. Etiam dapibus dolor sed semper scelerisque. ' + 
        'Morbi in iaculis sapien. Pellentesque non elit dignissim, maximus dolor nec, lacinia nisl. Duis ullamcorper pulvinar massa a vehicula. Donec ' + 
        'tempor velit non sem suscipit, et bibendum velit gravida.', '', true);


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

        function undo () {
            quill.history.undo();
        }
        
        function redo () {
            quill.history.redo();
        }
        
        function commitVersion () {    
    
            var commitName = $window.prompt("Whats your commit about?");
            if (commitName == null) return;
            if (commitName == "") {
                $window.alert("Commit name cannot be empty!");
                return;
            }

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
                $scope.commits.push(result);
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
            })
            
        }

        function loadCommit (commitId) {
            editorServices.getCommit(commitId)
            .then(function(result){
                quill.setContents(result.changes);
            })
        }

        function branchVersion () {
            alert("branch name?");
            console.log("Branchig version...");
        }
        
        function newScrap () {

            var scrap = {};
            var range = quill.getSelection(true);
            if (range) {
                if (range.length == 0) {
                    //TODO
                    $window.alert('Nothing selected');
                    return;

                } else {
                    
                    var text = quill.getText(range.index, range.length);
                    scrap.value = text;
                }
            } 
            else {
                //TODO
                $window.alert('cursor not in editor');
            }

            scrap.type = 'text';
            
            //TODO Ask For Tags
            var tags = ['tag1','tag2'];
            
            editorServices.newScrap (scrap, tags)
            .then(function(result){
                $scope.scraps.push(result);
                $scope.$apply();
            })
        }

        function scrapOnMouseOver (scrapId) {
            tooltipTimeoutPromise = $timeout(showScrapTooltip, 1000, true, scrapId);
        }

        function scrapOnMouseLeave (scrapId) {
            $timeout.cancel(tooltipTimeoutPromise);
            hideScrapTooltip();
        }

        function loadScrap (scrapId) {
            var range = quill.getSelection(true);
            if (range) {
                if (range.length == 0) {
                    editorServices.getScrap(scrapId)
                    .then(function(result){
                        quill.insertText(range.index, result.value, '', true);
                    })
                } else {
                    editorServices.getScrap(scrapId)
                    .then(function(result){
                        quill.deleteText(range.index, range.length);
                        quill.insertText(range.index, result.value, '', true);
                    })
                }
            } 
        }

        function showScrapTooltip (scrapId) {
            $timeout.cancel(tooltipTimeoutPromise);
            editorServices.getScrap(scrapId)
            .then(function(result){
                console.log(result);
            })
        }

        function hideScrapTooltip () {

        }

        $interval(saveDirtyChanges, saveDirtyInterval);
    
    }])
