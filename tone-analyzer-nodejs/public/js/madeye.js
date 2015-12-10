/* globals angular, produceToneColoring */

function articleAppController($scope) {

    $scope.response = null;
    $scope.text = null;
    $scope.article = null;

    $scope.mode = 'link';
    $scope.setMode = function(m) { $scope.mode = m; };

    $scope.coloring = null;
    $scope.setColoring = function (c) {
        $scope.coloring = c;
    };

    $scope.updateMood = function (mood) {
        $scope.mood = mood;
    };

    $scope.updateArticle = function (text) {
        $scope.article = text;
    };

    $scope.clear = function () {
        $scope.mood = null;
        $scope.text = null;
        $scope.article = null;
        $scope.coloring = null;
        $scope.$broadcast('clear');
    };
}


function getMoodFactory(server, $q, $http, $httpParamSerializerJQLike) {
    return function(text, endpoint) {
        var deferred = $q.defer();
        $http({
            url: server + endpoint,
            method: 'POST',
            data: $httpParamSerializerJQLike({
                text: text 
            })
        }).then(function (res) {
            deferred.resolve(res.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}

function readArticleFactory($q, $http, server) {
    return function (url) {
        var deferred = $q.defer();
        $http({
            url: server + '/read',
            method: 'GET',
            headers: {'Accept': 'text/plain'},
            params: {
                url: url,
            },
            paramSerializer: '$httpParamSerializerJQLike',
            transformResponse: function (v) {return v;}
        }).then(function(res) {
            deferred.resolve(res.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}


function textBasedController($scope, analyze, $location, $anchorScroll) {
    $scope.submit = function() {
        $scope.loading = true;
        analyze($scope.text, '/tone')
        .then(function(tone) {
            $scope.setColoring(produceToneColoring(tone));
            return analyze($scope.text, '/mood');
        }).then(function(data) {
            $scope.updateMood(data.mood);
            $location.hash('mood');
            $anchorScroll();
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.$on('clear', function() {
        $scope.text = null;
    });
}

function urlBasedController($scope, readArticle, analyze, $location, $anchorScroll) {
    $scope.submit = function() {
        $scope.loading = true;
        readArticle($scope.url).then(function(content) {
            $scope.updateArticle(content);
            return analyze(content, '/tone');
        }).then(function(tone) {
            $scope.setColoring(produceToneColoring(tone));
            return analyze($scope.article, '/mood');
        }).then(function(data) {
            $scope.updateMood(data.mood);
            $location.hash('mood');
            $anchorScroll();
        }).finally(function() {
            $scope.loading = false;
        });
    };

    $scope.$on('clear', function() {
        $scope.url = null;
    });
}

function wordColorDirective() {
    function link(scope, element, attrs) {

        function color(coloring) {
            var words = element.html().split(' ');
            for (var i = 0; i < words.length; i++) {
                if (words[i] in coloring.words) {
                    words[i] = '<span style="color: ' + coloring.words[words[i]] + ';">' +
                        words[i] + '</span>';
                }
            }
            element.html(words.join(' '));
        }

        scope.$watch(attrs.colorWords, function(coloring) {
            if (coloring && coloring.words) {
                color(coloring);
            }
        });

    }
    return {
        link: link
    };
}

function setClassAtTopDirective($window) {
	var $win = angular.element($window); // wrap window object as jQuery object

	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var topClass = attrs.setClassAtTop; // get CSS class from directive's attribute value
			var offsetTop = element.offset().top; // get element's offset top relative to document
			var fixed = false;

			$win.on('scroll', function () {
			    if (!fixed) {
                    offsetTop = element.offset().top;
                }
				if ($win.scrollTop() >= offsetTop) {
					element.addClass(topClass);
					fixed = true;
				} else {
					element.removeClass(topClass);
					fixed = false;
				}
			});
		}
	};
}



(function() {
    var app = angular.module('madeye', ['hc.marked', 'angularSpinner']);

    app.config(function($httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] =
            'application/x-www-form-urlencoded';
    });

    app.value('server', '//tone-analyzer-cs252.mybluemix.net'); 
    //app.value('server', 'http://localhost:3000'); 

    app.filter('htmlToPlaintext', function() {
        return function(text) {
            return angular.element(text).text();
        };
    });

    app.factory('analyze', getMoodFactory);
    app.factory('readArticle', readArticleFactory);
    
    app.controller('article-app', articleAppController);
    app.controller('text-based', textBasedController);
    app.controller('url-based', urlBasedController);

    app.directive('colorWords', wordColorDirective);
    app.directive('setClassAtTop', setClassAtTopDirective);

})();
