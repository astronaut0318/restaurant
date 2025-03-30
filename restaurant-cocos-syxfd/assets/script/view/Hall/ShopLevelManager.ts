import { LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import CountManager from "./CountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopLevelManager extends cc.Component {

    private static _instance: ShopLevelManager = null;
    public static get inst(): ShopLevelManager {
        return this._instance || (this._instance = new ShopLevelManager());
    }

    public findShopLevelData() {
        let CashOutConfig = Global.localConfig[LOCAL_CONFIG.CashOutConfig];
        let count = CountManager.inst.findServiceCount();

        let lvlData = CashOutConfig[0];
        for (let i = 0; i < CashOutConfig.length; i++) {
            let element = CashOutConfig[i];
            if (count >= element.needCustomer) {
                let idx = i + 1;
                if (idx >= CashOutConfig.length - 1) {
                    idx = CashOutConfig.length - 1;
                }
                lvlData = CashOutConfig[idx];
            }
        }
        // count = count - this.findNowLvlNeedCustomer(lvlData.shopLevel);
        let progress = (count / lvlData.needCustomer) * 100;
        progress = Utils.toFixed2(progress);
        if (progress > 100) progress = 100;
        lvlData["progress"] = progress;
        return lvlData;
    }

    public findShopLevelReward() {
        let CashOutConfig = Global.localConfig[LOCAL_CONFIG.CashOutConfig];
        let count = CountManager.inst.findServiceCount();
        let lvlData = this.findShopLevelData();
        let rewardGeted: number[] = GameStorage.getJson(STORAGE_KEY.SHOP_LEVEL_REWARD_GETED, []);
        let rewardList = [];

        for (let i = 0; i < CashOutConfig.length; i++) {
            let element = CashOutConfig[i];
            if (element.shopLevel < lvlData.shopLevel) {
                element["canGet"] = true;
                element["geted"] = rewardGeted.includes(element.id);
                element["diff"] = 0;
                element["progress"] = element.needCustomer;
            } else {
                element["canGet"] = false;
                element["diff"] = element.needCustomer - count;
                element["progress"] = count;
            }

            rewardList.push(element);
        }
        return rewardList;
    }

    public findShopLevelRewardByShopLvl(lvl) {
        let list = this.findShopLevelReward();
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.shopLevel == lvl) {
                return element;
            }
        }
        return null;
    }

    public getShopLevelReward(id, callback) {
        let rewardGeted: number[] = GameStorage.getJson(STORAGE_KEY.SHOP_LEVEL_REWARD_GETED, []);
        if (!rewardGeted.includes(id)) {
            rewardGeted.push(id);
            GameStorage.setJson(STORAGE_KEY.SHOP_LEVEL_REWARD_GETED, rewardGeted);
            if (callback) callback(true);
        } else {
            console.error("已经领取了")
            if (callback) callback(false);
        }

    }

    public findNowLvlNeedCustomer(lvl) {
        let count = 0;
        let CashOutConfig: any[] = Global.localConfig[LOCAL_CONFIG.CashOutConfig];
        for (let i = 0; i < CashOutConfig.length; i++) {
            const element = CashOutConfig[i];
            if (element.shopLevel == lvl) {
                count = (element.needCustomer || 0);
            }
        }
        return count;
    }

    public setShopUpLevel() {
        let shopLevel = GameStorage.getJson(STORAGE_KEY.NOW_SHOP_LEVEL, { id: 1, lvl: 1 });
        let id = shopLevel.id + 1;
        let lvl = shopLevel.lvl + 1;
        console.log("饭店升级 setShopUpLevel: " + lvl.toString());
        GameStorage.setJson(STORAGE_KEY.NOW_SHOP_LEVEL, { id, lvl });
    }

}
