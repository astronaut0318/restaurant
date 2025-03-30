// * 引导任务类型
// * 1.购买吧台、桌子  1
// * 2.购买装饰地毯等7-12类型 1
// * 5.解锁菜谱 1
// * 7.解锁厨娘 1
// * 8.升级厨娘 n
// * 9.一键揽客次数 n
// * 10.累计收益翻倍次数 n
// * 11.自动服务次数 n
// */

import { EVENT_TAG, LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import CountManager from "./CountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskGuideManager extends cc.Component {

    private static _instance: TaskGuideManager = null;

    public static get inst(): TaskGuideManager {
        return this._instance || (this._instance = new TaskGuideManager());
    }

    public getGuide() {
        let nowTaskState = GameStorage.getJson(STORAGE_KEY.NOW_TASK_GUIDE, { id: 1 });
        let guide = this.findGuideTask(nowTaskState.id);
        if (!guide) return;

        let _data = { condition_value2: 0, detailInfo: null };
        switch (guide.conditionType) {
            case 1:
                _data = this.guideTable(guide)
                break;
            case 2:
                _data = this.guideDecoration(guide);
                break;
            case 5:
                _data = this.guideFood(guide);
                break;
            case 7:
                _data = this.guideCookWoman(guide);
                break;
            case 8:
                _data = this.guideCookWomanLvl(guide);
                break;
            case 9:
                _data = this.guideQuik(guide);
                break;
            case 10:
                _data = this.guideDoubleIncome(guide);
                break;
            case 11:
                _data = this.guideAutoService(guide);
                break;
        }

        guide["condition_value2"] = _data.condition_value2;
        _data.detailInfo["showBuy"] = true;
        _data.detailInfo["isGuide"] = true;
        guide["detailInfo"] = _data.detailInfo;
        guide["isok"] = _data.condition_value2 >= guide.conditionValue;
        let lastTask = this.findLastTask();
        guide["allGuideOk"] = guide.id >= lastTask.id;

        return guide;
    }

    private guideTable(guide) {
        let unlockTables: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES, []);
        let tableId = guide.conditionParam * 10 + guide.conditionParam2;
        let condition_value2 = unlockTables.includes(tableId) ? 1 : 0;
        let detailInfo = Utils.findTableById(tableId);
        detailInfo["type"] = detailInfo.tablePosId;
        detailInfo["unlock"] = false;
        detailInfo["isUse"] = false;
        detailInfo["needMoney"] = detailInfo.upgrade;
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideDecoration(guide) {
        let unlockDecoration: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []);
        let decorationId = (guide.conditionParam - 1) * 10 + guide.conditionParam2;
        let condition_value2 = unlockDecoration.includes(decorationId) ? 1 : 0;
        let detailInfo = Utils.findDecorationsById(decorationId);
        console.log("guideDecoration",detailInfo )
        detailInfo["type"] = 6 + detailInfo.decorationId;
        detailInfo["unlock"] = false;
        detailInfo["isUse"] = false;
        detailInfo["needMoney"] = detailInfo.needMoney;
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideFood(guide) {
        let unlockFoods: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS, []);
        let foodId = guide.conditionParam;
        let condition_value2 = unlockFoods.includes(foodId) ? 1 : 0;
        let detailInfo = Utils.findFoodById(foodId);
        let upgradeData = Utils.findFoodUpgradeData(foodId, 1);
        detailInfo["upgradeData"] = upgradeData;
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideCookWoman(guide) {
        let unlockCookWomans: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_COOK_WOMAN, []);
        let womanId = guide.conditionParam;
        let condition_value2 = unlockCookWomans.includes(womanId) ? 1 : 0;
        let detailInfo = Utils.formatCookWoman()[womanId - 2];
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideCookWomanLvl(guide) {
        let cookWomansLvl: number[] = GameStorage.getJson(STORAGE_KEY.COOK_WOMAN_LEVEL, {});
        let womanId = guide.conditionParam;
        let condition_value2 = cookWomansLvl[womanId] >= guide.conditionValue ? guide.conditionValue : cookWomansLvl[womanId];
        let detailInfo = Utils.formatCookWoman()[womanId - 2];
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideQuik(guide) {
        let count = CountManager.inst.findQuikCustomerCount();
        let condition_value2 = count >= guide.conditionValue ? guide.conditionValue : count;
        let detailInfo = {};
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideDoubleIncome(guide) {
        let count = CountManager.inst.findDoubleIncomeCount();
        let condition_value2 = count >= guide.conditionValue ? guide.conditionValue : count;
        let detailInfo = {};
        return {
            condition_value2,
            detailInfo
        }
    }

    private guideAutoService(guide) {
        let count = CountManager.inst.findAutoServiceCount();
        let condition_value2 = count >= guide.conditionValue ? guide.conditionValue : count;
        let detailInfo = {};
        return {
            condition_value2,
            detailInfo
        }
    }

    public getReward(taskId) {
        let guide = this.getGuide();
        if (guide.id !== taskId) {
            console.error("任务id错误");
        }
        if (!guide.isok) {
            console.error("任务未完成");
        }
        main.emit(EVENT_TAG.ADD_FLY_MONEY, guide.rewardMoney);
        taskId++;
        let lastTask = this.findLastTask();
        if (taskId >= lastTask.id) {
            taskId = lastTask.id;
        }
        GameStorage.setJson(STORAGE_KEY.NOW_TASK_GUIDE, { id: taskId });
    }

    private findLastTask() {
        let guideTasks: any[] = Global.localConfig[LOCAL_CONFIG.GuideTask];
        return guideTasks[guideTasks.length - 1];
    }

    private findGuideTask(id) {
        let guideTasks = Global.localConfig[LOCAL_CONFIG.GuideTask];
        for (let i = 0; i < guideTasks.length; i++) {
            let element = guideTasks[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

}
