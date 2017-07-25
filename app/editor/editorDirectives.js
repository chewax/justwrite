angular.module('justWrite.editor')

    .directive('ctxMenu', function($timeout) {
    return {
        restrict: 'E',
        replace: false,
        link: function(scope, elem, attrs) {
            
            var editor = angular.element(document.querySelector('.ql-editor'));
            var menu = angular.element('<div class="ctx-menu"></div>');
            // var ul = angular.element('<ul></ul>');

            editor.on( "contextmenu", function($event) {

                $event.preventDefault();
                menu.remove();

                menu = angular.element('<div class="ctx-menu"></div>');
                var ul = angular.element('<ul></ul>');

                var options = scope['ctxMenuOptions'];

                options.forEach(function(opt){
                    var li = angular.element('<li>'+opt.text+'</li>');
                    li.on("click", opt.onClick);
                    ul.append(li);
                })
                
                menu.append(ul);
                elem.append(menu);
                
                //Wait for the height to calculate so we can display correctly
                $timeout(show, false);
                
                function show() {
                    var top = $event.offsetX + 20;
                    var left = $event.offsetY + 20;
                    menu.css("left",  top + 'px');
                    menu.css("top",  left + 'px');  
                }
            });

            editor.on( "click", function($event) {
                if (menu) menu.remove();
            });

            
        }
    };
});

