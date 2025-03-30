// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import GameStorage from "../../utils/GameStorage";
import CountManager from "./CountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WithdrawManager extends cc.Component {

    private static _instance: WithdrawManager = null
    public static get inst(): WithdrawManager {
        return this._instance || (this._instance = new WithdrawManager());
    }

    public findByLvlData() {
        let _returnData = [];
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let byLvlData: any[] = Withdraw["by_lvl"];
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_BY_LVL, []);

        for (let i = 0; i < byLvlData.length; i++) {
            const data = byLvlData[i];
            if (!localData.includes(data.id)) {
                _returnData.push(data);
            }
        }

        return _returnData;
    }

    public checkByLvl(id) {
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_BY_LVL, []);
        if (localData.includes(id)) {
            return false;
        }

        let _tempdata;
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let byLvlData: any[] = Withdraw["by_lvl"];
        for (let i = 0; i < byLvlData.length; i++) {
            const data = byLvlData[i];
            if (data.id === id) {
                _tempdata = data;
            }
        }

        if (!_tempdata) {
            return false;
        }
        return Global.shopLevel >= _tempdata.shopLevel;
    }

    public getByLvlRewerd(id, callback) {
        let ok = this.checkByLvl(id);
        if (ok) {
            let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_BY_LVL, []);
            localData.push(id);
            GameStorage.setJson(STORAGE_KEY.GET_W_D_BY_LVL, localData);
            callback && callback();
        }
    }

    public findOnceData() {
        let _returnData = [];
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let onceData: any[] = Withdraw["once"];
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_ONCE, []);

        for (let i = 0; i < onceData.length; i++) {
            const data = onceData[i];
            if (!localData.includes(data.id)) {
                _returnData.push(data);
            }
        }

        return _returnData;
    }

    public checkOnce(id) {
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_ONCE, []);
        if (localData.includes(id)) {
            return false;
        }

        let _tempdata;
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let byLvlData: any[] = Withdraw["once"];
        for (let i = 0; i < byLvlData.length; i++) {
            const data = byLvlData[i];
            if (data.id === id) {
                _tempdata = data;
            }
        }

        if (!_tempdata) {
            return false;
        }

        let loginDay = CountManager.inst.findLoginDayCount();
        return loginDay >= _tempdata.need_login_day_count;
    }

    public getOnceRewerd(id, callback) {
        let ok = this.checkOnce(id);
        if (ok) {
            let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_ONCE, []);
            localData.push(id);
            GameStorage.setJson(STORAGE_KEY.GET_W_D_ONCE, localData);
            callback && callback();
        }
    }

    public findShareData() {
        let _returnData = [];
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let shareData: any[] = Withdraw["share"];
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_SHARE, []);

        for (let i = 0; i < shareData.length; i++) {
            const data = shareData[i];
            let totalCount = localData[data.id];
            if (totalCount == null || totalCount == undefined) {
                _returnData.push(data);
            } else {
                if (totalCount > 0) {
                    _returnData.push(data);
                }
            }
        }

        return _returnData;
    }

    public getShareRewerd(id, callback) {
        let localData: number[] = GameStorage.getJson(STORAGE_KEY.GET_W_D_SHARE, []);
        let _tempdata;
        let Withdraw: any[] = Global.localConfig[LOCAL_CONFIG.Withdraw];//[0]
        let shareData: any[] = Withdraw["share"];
        for (let i = 0; i < shareData.length; i++) {
            const data = shareData[i];
            if (data.id === id) {
                _tempdata = data;
            }
        }

        let totalCount = localData[id];
        if (totalCount == null || totalCount == undefined) {
            totalCount = _tempdata.totalcount;
            totalCount -= 1;
            localData[id] = totalCount;
            GameStorage.setJson(STORAGE_KEY.GET_W_D_SHARE, localData);
            callback && callback();
        } else {
            if (totalCount > 0) {
                totalCount -= 1;
                localData[id] = totalCount;
                GameStorage.setJson(STORAGE_KEY.GET_W_D_SHARE, localData);
                callback && callback();
            } else {
                console.error("没有提现次数");
            }
        }
    }

}
