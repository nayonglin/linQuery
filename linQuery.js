(function (window) {

    // 定义本地linQuery
    linQuery = function (name) {
        return new linQuery.prototype.init(name);
    };

    var

        core_toString = Object.prototype.toString;
    core_hasOwn = Object.prototype.hasOwnProperty,
        core_indexOf = Array.prototype.indexOf,

        // 匹配一个非空白字符
        core_rnotwhite = /\S/,
        // 匹配多个空白字符
        core_rspace = /\s+/;


    class2type = {};


    linQuery.fn = linQuery.prototype = {
        constructor: linQuery,
        init: function (name) {
            this.name = name;
            return this;
        },
        logName: function () {
            console.log(this.name);
        }
    }

    linQuery.Callbacks = function (options) {

        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            linQuery.extend({}, options);
        var // 最后一次执行的值
            memory,
            // 是否已经执行过
            fired,
            // 是否正在执行
            firing,
            // 执行的起始下标
            firingStart,
            // 回调列表的长度
            firingLength,
            // 正在执行的回调下标(如果需要，通过remove修改)
            firingIndex,
            // 回调列表
            list = [],
            // 重复执行列表堆栈
            stack = !options.once && [],
            //执行回调
            fire = function (data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing: true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false; // 避免使用add进行更深度的调用
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
            // 实际的回调对象
            self = {
                // 增加一个回调或者回调的集合
                add: function () {
    
                    if (list) {
                        // 保存长度
                        var start = list.length;
                        (function add(args) {
                          
                            linQuery.each(args, function (_, arg) {
     
                                var type = linQuery.type(arg);
                                if (type === "function") {
                                    if (!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                } else if (arg && arg.length && type !== "string") {
                                    add(arg);
                                }
                            })
                        })(arguments);
                        // 是否需要add回调到正在执行的列表
                        if (firing) {
                            firingLength = list.length;
                            //有memory的话，如果我们不是正在执行，我们应该立即调用
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                // 移除一个回调
                remove: function () {
                    if (list) {
                        linQuery.each(arguments, function (_, arg) {
                            var index;
                            while ((index = linQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);

                                //如果正在执行中
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // 判断给定的回调是否在list列表中
                has: function (fn) {
                    return linQuery.inArray(fn, list) > -1;
                },
                // 清空list列表
                empty: function () {
                    list = [];
                    return this;
                },
                // 让一个列表失效
                disable: function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // 判断是否已失效
                disabled: function () {
                    return !list;
                },
                // 锁定列表
                lock: function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                // 列表是否被锁
                locked: function () {
                    return !stack;
                },
                // 打印list列表
                log: function () {
                    console.log(list)
                },
                // 使用给的上下文和参数调用回调列表
                fireWith: function (context, args) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    if (list && (!fired || stack)) {
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return this;
                },
                // 用给定的参数调用回调
                fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                fired: function () {
                    return !!fired;
                }
            };
        return self;
    }



    // 这里给原型也添加了extend，所以linQuery实例对象也可以使用该方法
    linQuery.extend = linQuery.fn.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // 深度复制的情况
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {},

                i = 2;
        }

        // 当传入的第一个参数为字符串类型或者布尔类型(深度复制时)
        if (typeof target !== "object" && !linQuery.isFunction(target)) {
            target = {};
        }

        // 如果只传了一个参数，继承linQuery自身
        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // 只处理参数为非null和非undefined的情况
            if ((options = arguments[i]) != null) {
                // 继承基本对象
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // 防止死循环
                    if (target === copy) {
                        continue;
                    }

                    // 当属性也为对象或者数组时递归
                    if (deep && copy && (linQuery.isPlainObject(copy) || (copyIsArray = linQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && linQuery.isArray(src) ? src : [];
                        } else {
                            clone = src && linQuery.isPlainObject(src) ? src : {};
                        }

                        //给属性递归赋值
                        target[name] = linQuery.extend(deep, clone, copy);


                        // 不复制undefined值     
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // 返回修改过的对象
        return target;
    }

    // 添加一些常用的辅助方法
    linQuery.extend({
        isFunction: function (obj) {
            return linQuery.type(obj) === "function";
        },
        isArray: Array.isArray || function (obj) {
            return linQuery.type(obj) === "array";
        },
        isPlainObject: function (obj) {
            // 必须是一个类
            // 因为ie，我们不得不检查constructor属性的存在
            // 确定是dom节点，并且window不是window对象
            if (!obj || linQuery.type(obj) !== "object" || obj.nodeType || linQuery.isWindow(obj)) {
                return false;
            }

            try {
                // 没有constructor属性一定是对象
                if (obj.constructor &&
                    !core_hasOwn.call(obj, "constructor") &&
                    !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }

            } catch (e) {
                // ie8，9将会抛出一个错误
                return false;
            }

            // 拥有属性的对象会被枚举
            var key;
            for (key in obj) {}

            return key === undefined || core_hasOwn.call(obj, key);


        },
        type: function (obj) {
            return obj == null ?
                String(obj) :
                class2type[core_toString.call(obj)] || "object";
        },

        // args仅仅提供给内部使用
        each: function (obj, callback, args) {
            var name,
                i = 0,
                length = obj.length,
                isObj = length === undefined || linQuery.isFunction(obj);

            // 带参数的情况
            if (args) {
                if (isObj) {
                    for (name in obj) {
                        if (callback.apply(obj[name], args) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length;) {
                        if (callback.apply(obj[i++], args) === false) {
                            break;
                        }
                    }
                }
            } else { // 不带参数的情况
                if (isObj) {
                    for (name in obj) {
                        if (callback.call(obj[name], name, obj[name]) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length;) {
                        if (callback.call(obj[i], i, obj[i++]) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        inArray: function (elem, arr, i) {
            var len;

            if (arr) {
                if (core_indexOf) {
                    return core_indexOf.call(arr, elem, i);
                }

                len = arr.length;
                i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

                if (i) {
                    if (i < 0) {
                        Math.max(0, len + i);
                    } else {
                        i = i;
                    }
                } else {
                    i = 0;
                }

                for (; i < len; i++) {
                    if (i in arr && arr[i] === elem) {
                        return i;
                    }
                }
            }
            return -1;
        }

    });


    // 填充 class2type 映射
    linQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    var optionsCache = {};




    function createOptions(options) {
        var object = optionsCache[options] = {};
        linQuery.each(options.split(core_rspace), function (_, flag) {
            object[flag] = true;
        });
        return object;
    }


    linQuery.prototype.init.prototype = linQuery.prototype;
    window.$ = window.linQuery = linQuery; // 在window下定义$
})(window);


// 无new构建测试
// var a = $("lin");
// a.logName();


