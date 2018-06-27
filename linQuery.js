(function (window) {

    // 定义本地linQuery
    linQuery = function (name) {
        return new linQuery.prototype.init(name);
    };

    var


        // 在写入linQuery之前保存之前已经写入的$
        _$ = window.$,
        _linQuery = window.linQuery,

        core_toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        core_indexOf = Array.prototype.indexOf,
        core_slice = Array.prototype.slice,

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
    };



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
        noConflict: function () {
            if (window.$ === linQuery) {
                window.$ = _$;
            }
            if (deep && window.linQuery === linQuery) {
                window.linQuery = _linQuery;
            }

            return linQuery;
        },
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

    linQuery.extend({
        Deferred: function (func) {
            var deferred = {},
                tuples = [
                    ["resolve", "done", linQuery.Callbacks("once memory"), "resolved"],
                    ["reject", "fail", linQuery.Callbacks("once memory"), "rejected"],
                    ["notify", "progress", linQuery.Callbacks("memory")]
                ],
                state = "pending",
                promise = {
                    // 获取当前队列的状态
                    state: function () {
                        return state;
                    },
                    // 无论成功还是失败都会执行，其实也就是给done和fail队列都添加传入的方法
                    always: function () {
                        deferred.done(arguments).fail(arguments);
                        return this;
                    },
                    // 同时添加done,fail,progress
                    then: function () {
                        // fns = [fnDone, fnFail, fnProgress]
                        var fns = arguments;

                        //这里return linQuery.Deferred(function( newDefer ) {}).promise();
                        //为何还要使用linQuery.Deferred来包装
                        //就then比较特殊需要重新调promise方法来屏蔽resolve|reject|notify这些接口？
                        return linQuery.Deferred(function (newDefer) {

                            linQuery.each(tuples, function (i, tuple) {

                                //action = [resolve | reject | notify]
                                var action = tuple[0],
                                    //分别对应fnDone, fnFail, fnProgress
                                    fn = fns[i];

                                //为何这里不能直接：deferred[ tuple[1] ](fn)

                                // deferred[ done | fail | progress ] for forwarding actions to newDefer
                                // tuple[1] = [ done | fail | progress ]
                                deferred[tuple[1]](linQuery.isFunction(fn) ?
                                    function () {
                                        //当前的this == deferred
                                        var returned = fn.apply(this, arguments);

                                        //如果回调返回的是一个Deferred实例
                                        if (returned && linQuery.isFunction(returned.promise)) {
                                            //则继续派发事件
                                            returned.promise()
                                                .done(newDefer.resolve)
                                                .fail(newDefer.reject)
                                                .progress(newDefer.notify);
                                        }
                                        //如果回调返回的是不是一个Deferred实例，则被当做args由XXXWith派发出去
                                        else {
                                            newDefer[action + "With"](this === deferred ? newDefer : this, [returned]);
                                        }
                                    } :
                                    //传进来的不是函数
                                    //则默认调用[resolve | reject | notify]派发事件出去
                                    newDefer[action]
                                );
                            });
                            //这里的fns已经没用了，有用的fn引用已经被记录了
                            //退出前手工设置null避免闭包造成的内存占用
                            fns = null;
                        }).promise();
                    },
                    // 在这里obj绑定了[resolve | reject | notify]这些方法
                    promise: function (obj) {
                        return obj != null ? linQuery.extend(obj, promise) : promise;
                    }
                };

            // 这句是为了兼容旧版
            promise.pipe = promise.then;

            linQuery.each(tuples, function (i, tuple) {
                var list = tuple[2], // 对应的队列
                    stateString = tuple[3]; // 执行之后对应的状态

                // 其实done|fail|progress底层就是使用callbacks的add方法去添加列表
                promise[tuple[1]] = list.add;

                // 处理中是没有最后状态的
                if (stateString) {
                    list.add(
                        // 修改最终状态
                        function () {
                            state = stateString;
                        },
                        // 禁用对立的那条队列
                        // 注意 0^1 = 1   1^1 = 0
                        // 即是成功的时候，把失败那条队列禁用
                        // 即是成功的时候，把成功那条队列禁用
                        // [ reject_list | resolve_list ].disable; progress_list.lock
                        tuples[i ^ 1][2].disable,

                        // 锁住当前队列状态
                        tuples[2][2].lock);
                }

                // deferred[ resolve | reject | notify ] = list.fire
                // tuple[0] == resolve | reject | notify 
                // 可以看到 resolve|reject|notify其实就是Callbacks里边的fire方法
                // 而resolveWith|rejectWith|notifyWith其实就是Callbacks里边的fireWith方法
                deferred[tuple[0]] = list.fire;
                deferred[tuple[0] + "With"] = list.fireWith;
            });

            // 扩展deferred的then | done | fail | progress等方法
            promise.promise(deferred);

            // 如果传入func，则把执行上下文和参数设置为当前生成的deferred实例
            if (func) {
                func.call(deferred, deferred);
            }

            return deferred;
        },
        // 当一个任务失败时，代表整个都失败了
        // 任务是Deferred时，成为异步任务
        // 任务是function是，成为同步任务
        when: function (subordinate) {
            var i = 0,
                resolveValues = core_slice.call(arguments),
                length = resolveValues.length,

                // 还没完成的异步任务数
                remaining = length !== 1 || (subordinate && linQuery.isFunction(subordinate.promise)) ? length : 0,

                // 只有一个异步任务的时候,直接返回subordinate，否则创建一个新的Deferred对象返回
                deferred = remaining === 1 ? subordinate : linQuery.Deferred(),

                // 用于更新 成功|处理 中两个状态
                // 不考虑失败状态因为： 当一个任务失败后，代表整个都失败了
                updateFunc = function (i, contexts, values) {
                    return function (value) {
                        contexts[i] = this;
                        values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
                        if (values === progressValues) { // 处理中，派发正在处理事件
                            deferred.notifyWith(contexts, value);
                        } else if (!(--remaining)) { // 成功，并且剩余的异步任务为0
                            deferred.resolveWith(contexts, values);
                        }
                    }
                },

                progressValues, progressContexts, resolveContexts;

            //如果只有一个任务，可以不用做维护状态的处理了
            //只有大于1个任务才需要维护任务的状态
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                //事件包含的上下文是当前任务前边的所有任务的一个集合，逐步更新
                resolveContexts = new Array(length);
                for (; i < length; i++) {
                    if (resolveValues[i] && linQuery.isFunction(resolveValues[i].promise)) {
                        //如果是异步任务

                        resolveValues[i].promise()

                            //成功的时候不断更新自己的状态
                            .done(updateFunc(i, resolveContexts, resolveValues))

                            //当一个任务失败的时候，代表整个都失败了。直接派发一个失败即可
                            .fail(deferred.reject)

                            //正在处理的时候也要不断更新自己的状态
                            .progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                        //如果是同步任务，则remain不应该计它在内
                        --remaining;
                    }
                }
            }
            //传进来的任务都是同步任务
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }

            return deferred.promise();
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