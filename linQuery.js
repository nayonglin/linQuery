
(function (window){

    // 定义本地linQuery
    linQuery = function (name) {
        return new linQuery.prototype.init(name);
    };


    linQuery.fn = linQuery.prototype = {
        constructor: linQuery,
        init: function (name) {
            this.name = name;
            return this;
        },
        logName: function() {
            console.log(this.name);
        },
    }


   linQuery.prototype.init.prototype = linQuery.prototype;  // 
   window.$ = window.linQuery = linQuery;  // 在window下定义$
})(window);


var a = $("xixi");
a.logName();