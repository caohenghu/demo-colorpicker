angular.module('eqx.colorpicker', [])
    .factory('colorService', function() {
        var historyColors,
            colors = [
            '000000', '222222', '444444', '666666', '888888', 'aaaaaa', 'cccccc', 'eeeeee', 'ffffff',
            '980000', 'ff0000', 'ff9900', 'ffff00', '00ff00', '00ffff', '4a86e8', '0000ff', '9900ff','a8276b',
            'e6b8af', 'f4cccc', 'fce5cd', 'fff2cc', 'd9ead3', 'd0e0e3', 'c9daf8', 'cfe2f3', 'd9d2e9', 'ead1dc',
            'dd7e6b', 'ea9999', 'f9cb9c', 'ffe599', 'b6d7a8', 'a2c4c9', 'a4c2f4', '9fc5e8', 'b4a7d6', 'd5a6bd',
            'cc4125', 'e06666', 'f6b26b', 'ffd966', '93c47d', '76a5af', '6d9eeb', '6fa8dc', '8e7cc3', 'c27ba0',
            'a61c00', 'cc0000', 'e69138', 'f1c232', '6aa84f', '45818e', '3c78d8', '3d85c6', '674ea7', 'a64d79',
            '5b0f00', '660000', '783f04', '7f6000', '274e13', '0c343d', '1c4587', '073763', '20124d', '4c1130'
        ];

        return {
            safeApply       : safeApply,
            getColors       : getColors,
            setHistoryColors: setHistoryColors,
            getHistoryColors: getHistoryColors
        };

        function getColors() {
            return angular.copy(colors);
        }

        function setHistoryColors(color) {
            if(historyColors.indexOf(color) > -1) return;
            historyColors.unshift(color);
            if(historyColors.length > 7) {
                historyColors.pop();
            }
            localStorage.setItem('historyColor', historyColors.join(','));
        }

        function getHistoryColors() {
            historyColors = localStorage.getItem('historyColor');
            historyColors = historyColors ? historyColors.split(',') : [];
            return historyColors;
        }

        function safeApply(scope, fn) {
            var phase = scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            }else {
                scope.$apply(fn);
            }
        }
    })
    .directive('eqdColorpicker', function($compile, colorService) {
        var $document = $(document);
        var template =  '<div class="eqc-colorpicker" ng-show="visible">' +
                        '<div class="eqc-color" ng-click="chooseColor($event)">' + 
                        '<div class="select">' +
                        '<ul>' +
                        '<li ng-repeat="color in greyColors" ng-style="{backgroundColor: \'#\' + color}" color="{{color}}"></li>' +
                        '<li class="clear"></li>' +
                        '<li ng-repeat="color in richColors" ng-style="{backgroundColor: \'#\' + color}" color="{{color}}"></li>' +
                        '</ul>' +
                        '</div>' +
                        '<div class="history">' +
                        '<ul>' +
                        '<div class="more">最近使用</div>' +
                        '<li ng-repeat="color in historyColors" ng-style="{backgroundColor: \'#\' + color}" color="{{color}}"></li>' +
                        '</ul>' +
                        '</div>' +
                        '<input eqd-color-more />' +
                        '</div>' +
                        '</div>';
        return {
            scope: {
                selectColor: '=',
                defaultColor: '@',
                align: '@',
                offsetLeft: '@',
                offsetTop: '@'
            },
            link: link
        };

        function link($scope, $element) {
            var offset = $element.offset();
            $scope.pos = {
                top: offset.top,
                left: offset.left,
                width: $element.width(),
                height: $element.height()
            };

            var colors = colorService.getColors();
            $scope.greyColors = colors.slice(0, 9);
            $scope.richColors = colors.slice(9);
            $scope.historyColors = colorService.getHistoryColors();

            // var template = '<div class="eqc-colorpicker" ng-include="\'colorpicker.tpl.html\'"></div>';

            $('body').append($compile(template)($scope));

            $element.click(function(e) {
                e.stopPropagation();
                if($scope.visible) return;
                $scope.visible = true;
                $scope.$apply();
                $document.unbind('click').bind('click', function() {
                    $scope.visible = false;
                    $scope.$apply();
                    $document.unbind('click');
                });
            });
        }
    })
    .directive('eqdColorMore', function(colorService) {
        return {
            restrict: 'EA',
            link: link
        };

        function link($scope, $element) {
            var $colorpicker = $element.closest('.eqc-color').parent();

            setColorpickerPos($scope, $colorpicker);

            $colorpicker.click(function(e) {
                e.stopPropagation();
            });

            // $colorpicker.find('.more').click(function() {
            //     $colorpicker.toggleClass('more');
            // });

            var $picker = $element.colorpicker({
                inline: true,
                format: 'rgba',
                color: $scope.selectColor,
                container: $colorpicker,
                customClass: 'colorpicker-2x',
                sliders: {
                    saturation: {
                        maxLeft: 200,
                        maxTop: 200
                    },
                    hue: {
                        maxTop: 200
                    },
                    alpha: {
                        maxTop: 200
                    }
                }
            });

            $picker.on('changeColor', function(e) {
                colorService.safeApply($scope, function() {
                    var rgba = e.color.toRGB();
                    // if(rgba.a === 1) {
                    //     $scope.selectColor = e.color.toHex();
                    // } else {
                        $scope.selectColor = 'rgba(' + rgba.r + ',' +rgba.g + ',' +rgba.b + ',' +rgba.a + ')';
                    // }
                });
            });

            // $scope.$watch('selectColor', function(newVal) {
            //     $picker.colorpicker('setValue', newVal);
            // });

            $scope.chooseColor = function(e) {
                var $target = $(e.target);
                if(!$target.is('li')) return;
                var color = $target.attr('color');
                if(color) {
                    $scope.selectColor = '#' + color;
                    colorService.setHistoryColors(color);
                    $picker.colorpicker('setValue', '#' + color);
                } else {
                    $scope.selectColor = '';
                    $picker.colorpicker('setValue', 'transparent');
                }
            };
        }

        function setColorpickerPos($scope, $colorpicker) {
            var css = {};
            switch($scope.align) {
                case 'top':
                    break;
                case 'bottom':
                    break;
                case 'left':
                    break;
                case 'right':
                    break;
            }
            $colorpicker.css({
                top: $scope.offsetTop + 'px',
                left: $scope.offsetLeft + 'px'
            });
        }
    });