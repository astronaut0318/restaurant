const { ccclass } = cc._decorator;
@ccclass
export class Local extends cc.Component {
    static tag: string = 'gamename';
    static cache: any = { //需要存储的数据名
        // gold: 1000,
        // audio: 1,
        // json: { key: 'value' },
        // arr: '1,0,0,0,0,0,0,0',
    };
    static switch: Array<string> = [];
    /**
     * 初始化数据管理
     */
    static init() {
        window['localData'] = function () {
        }
        //没有进行初始化的情况下进行初始化,初始化之后将这个方法重新以防止多次初始化
        if (cc.sys.localStorage.getItem(Local.tag))
            Local.cache = JSON.parse(cc.sys.localStorage.getItem(Local.tag));
        Local.init = function () { };
        Local.save();
    };
    static getJson(key: string) {
        Local.init();
        let data = Local.cache[key];
        return (data);
    }
    static setJson(key: string, data: any) {
        Local.init();
        // let str = JSON.stringify(data);
        Local.cache[key] = data;
        if (Local.autoSave) Local.save();
        if (Local.switch.indexOf(key) != -1) Local.save();
        Local.listening(key, data);
    }

    /**
     * 获取数据
     * @param key 数值的KEY
     */
    static getData(key: string, isParseInt: boolean = false) {
        Local.init();
        let res: any = null;
        if (isParseInt)
            res = parseInt(Local.cache[key]);
        else
            res = Local.cache[key];
        return (res);
    };

    static getTranData(key: string) {
        Local.init();
        let str = '';
        let res = parseInt(Local.cache[key]);
        if (res > 1000) {
            let num = res / 1000;
            str = num.toFixed(2) + '千';
        } else if (res > 10000) {
            let num = res / 10000;
            str = num.toFixed(2) + '万';
        } else if (res > 1000000) {
            let num = res / 1000000;
            str = num.toFixed(2) + '百万';
        } else if (res > 100000000) {
            let num = res / 100000000;
            str = num.toFixed(2) + '亿';
        }
        let data = {
            num: res,
            str: str
        };
        return (data);
    }

    /**
     * 设置数据
     * @param key 数据KEY
     * @param value 数据VALUE
     */
    static setData(key: string, value: string | number) {
        console.log(key, value);
        Local.init();
        Local.cache[key] = value;
        if (Local.autoSave) Local.save();
        if (Local.switch.indexOf(key) != -1) Local.save();
        Local.listening(key, value);
    };

    /**
     * 加减运算属据
     * @param key 数据KEY
     * @param value 数据VALUE
     */
    static addData(key: string, value: number = 1) {
        Local.init();
        let data = Local.cache[key];
        data = data += value;
        Local.setData(key, data);
    };

    /**
     * 获取一组数据结构式ARRAY的数据
     * @param key 数据KEY
     */
    static getArray(key: string) {
        Local.init();
        let value = Local.cache[key];
        return (value);
    };
    /**
     * 将一个Array数据保存到缓存中
     * @param key 数据KEY
     * @param value 数据VALUE
     */
    static setArray(key: string, value: any) {
        Local.init();
        Local.setData(key, value);
        Local.listening(key, value);
    };
    /**
     * 保存chche中的数据到local中
     */
    static save() {
        Local.init();
        cc.sys.localStorage.setItem(Local.tag, JSON.stringify(Local.cache));
    };
    /**
     * 设置触发自动保存的关键字段,当这个设置的字段被修改时(set),将自动执行save将cache中的数据保存到local中
      * @param keys 数据KEY列表
     */
    static setTrigger(keys: Array<string> | string) {
        Local.init();
        if (typeof (keys) == "string") {
            if (Local.switch.indexOf(keys) == -1)
                Local.switch.push(keys);
        } else {
            keys.forEach((key) => {
                if (Local.switch.indexOf(key) == -1)
                    Local.switch.push(key);
            });
        }
    };
    /**
     * 同时获取一组数据
     * @param keys 获取的KEY
     */
    static getDataArray(keys: Array<string> | string, isParseInt: boolean = false) {
        let json = new Array();
        if (typeof (keys) == 'string') {
            json.push(Local.getData(keys, isParseInt));
        } else {
            keys.forEach((res) => {
                json.push(Local.getData(res, isParseInt));
            });
        }
        return (json);
    }
    /**
     * 尝试触发监听
     * @param key 数据KEY
     */
    static listening(key: string, value: any) {
        if (this['_' + key + 'Listening']) {
            this['_' + key + 'Listening'].forEach((res: cc.Node) => {
                if (res.isValid) {
                    res['_LocalListening'](value);
                }
            });
        }
    }
    /**
      * 添加数据变化监听器
      * @param key 数据KEY
      */
    static addListening(key: string, call: Function, node: cc.Node) {
        if (!this['_' + key + 'Listening']) {
            this['_' + key + 'Listening'] = new Array();
        }
        let instead = new cc.Node();
        instead.parent = node;
        instead['_LocalListening'] = call;
        this['_' + key + 'Listening'].push(instead);
        call(Local.getData(key));
    }

    static autoSave: boolean = false;
    static getAutoSave(): boolean {
        return (Local.autoSave);
    }
    /**
    * 设置自动保存
    * 在调试阶段统一使用自动保存
    * 测试阶段如果Local不影响游戏性能的前提下可以不更改自动保存的开关
    * 如果影响性能请不要使用自动保存
    */
    static setAutoSave(parameter: boolean): void {
        Local.autoSave = parameter;
    }
}


// let data = Local.getData('gold', true);
// Local.setData('gold', 10000);
// Local.addData('gold', 500);

// let json = Local.getJson('json');
// console.log(json);
// json.key = 'good';
// Local.setJson('json',json);

// Local.save();

// Local.setTrigger(['gold']);

// Local.setAutoSave(true);