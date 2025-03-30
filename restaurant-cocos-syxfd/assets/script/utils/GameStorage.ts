import { STORAGE_PREFIX } from "../config/GameConfig";
import { Global } from "../config/Global";
import Http from "./Http";
import Request2 from "./Request";

class GameStorage {
    private static _inst: GameStorage;

    private constructor() {
    }

    public static get inst(): GameStorage {
        if (!this._inst) {
            this._inst = new GameStorage();
        }
        return this._inst;
    }

    public syncToServerEnable = false;

    private syncToServer(key: string) {
        if (Global.noServer) return;
        if (!this.syncToServerEnable) return;

        const value = cc.sys.localStorage.getItem(key);
        let query = {
            key: key,
            value: value,
        }
        Request2.getApp().open('user/set', query, res => {
            // if (res.code == -1) {
            //     _LOG(`更新用户数据(${key})时添加了一个字段,需要重新访问以生效变更`);
            //     this.syncToServer(key);
            //     return;
            // } && res.errMsg == 'ok'
            if (res.code != 0) {
                _LOG(`更新用户数据(${key})失败`);
            }
        })
        return;


        let allStorageData = this.getAll();
        let data = {
            userid: Global.userid,
            data: JSON.stringify(allStorageData),
            level: Global.shopLevel
        }
        Http.request_post("setuserdata", data, res => {
            _LOG("同步远程用户数据", res);
        }, err => { })
    }
    1
    public getAll() {
        //遍历本地存储localStorage
        let obj = {};
        for (let i = 0; i < cc.sys.localStorage.length; i++) {
            let key: string = cc.sys.localStorage.key(i); //获取本地存储的Key
            if (key.includes("_tempdata")) {
                continue;
            }
            let value = localStorage.getItem(key);
            obj[key] = JSON.parse(value);
        }
        return obj;
    }

    public remove(key: string) {
        cc.sys.localStorage.removeItem(key);
    }

    public clear() {
        cc.sys.localStorage.clear();
    }

    public getString(key: string, defaultValue = "") {
        const value = cc.sys.localStorage.getItem(key);
        if (value != null) {
            return value;
        }
        return defaultValue;
    }

    public setString(key: string, value: string) {
        cc.sys.localStorage.setItem(key, value);
        if (key.includes("_tempdata")) {
        } else {
            this.syncToServer(key);
        }
    }

    public getInt(key: string, defaultValue = 0) {
        const value = cc.sys.localStorage.getItem(key);
        if (value != null) {
            return Number(parseInt(value).toFixed(1));
        }
        return defaultValue;
    }

    public setInt(key: string, value: number) {
        cc.sys.localStorage.setItem(key, value);
        if (key.includes("_tempdata")) {
        } else {
            this.syncToServer(key);
        }
    }

    public getBool(key: string, defaultValue = false) {
        const value = cc.sys.localStorage.getItem(key);
        if (value != null) {
            return parseInt(value) == 1;
        }
        return defaultValue;
    }

    public setBool(key: string, value: boolean) {
        cc.sys.localStorage.setItem(key, value ? "1" : "0");
        if (key.includes("_tempdata")) {
        } else {
            this.syncToServer(key);
        }
    }

    public getFloat(key: string, defaultValue = 0) {
        const value = cc.sys.localStorage.getItem(key);
        if (value != null) {
            return parseFloat(value);
        }
        return defaultValue;
    }

    public setFloat(key: string, value: number) {
        cc.sys.localStorage.setItem(key, value.toString());
        if (key.includes("_tempdata")) {
        } else {
            this.syncToServer(key);
        }
    }

    public getJson(key: string, defaultValue = null) {
        const value = cc.sys.localStorage.getItem(key);
        if (value != null) {
            return JSON.parse(value);
        }
        return defaultValue;
    }

    public setJson(key: string, value: object) {
        cc.sys.localStorage.setItem(key, JSON.stringify(value));
        if (key.includes("_tempdata")) {
        } else {
            this.syncToServer(key);
        }
    }
}

export default GameStorage.inst