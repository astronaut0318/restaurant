import Ad from "../../ad/Ad";
import { All_DAY_TEMP, LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import CCUtils from "../../utils/CCUtils";
import GameStorage from "../../utils/GameStorage";
import CountManager from "./CountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskManager extends cc.Component {

    private achievementConfigList: any[] = [];

    private static _instance: TaskManager = null;
    public static get inst(): TaskManager {
        return this._instance || (this._instance = new TaskManager());
    }

    public findTaskCanGet() {
        let data = {
            everyDayTaskCanGet: false,
            achievementCanGet: false,
        }
        let everyDayTask = this.getEveryDayTask();
        everyDayTask.forEach(val => {
            if (val != null) {
                if (val.canGet && !val.geted) {
                    data.everyDayTaskCanGet = true;
                }
            }
        })
        let achievement = this.getAchievement();
        achievement.forEach(val => {
            if (val != null) {
                if (val.canGet && !val.geted) {
                    data.achievementCanGet = true;
                }
            }
        })

        return data;
    }

    public getEveryDayTask() {
        let evreyDayTaskConfig: any[] = Global.localConfig[LOCAL_CONFIG.EveryDayTaskConfig];
        let dataList = [];
        evreyDayTaskConfig.forEach((item: any) => {
            let progress = 0;
            switch (item.id) {
                case 1:
                    progress = CountManager.inst.findEveryDayLookVideoCount();
                    break;
                case 2:
                    progress = CountManager.inst.findEveryDayServiceCount();
                    break;
                case 3:
                    progress = CountManager.inst.findEveryDayQuikCustomerCount();
                    break;
                case 4:
                    progress = CountManager.inst.findEveryDayTuhaoCount();
                    break;
                case 5:
                    progress = CountManager.inst.findEveryDayGetIncome();
                    break;
            }
            let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
            // let aGeted: number[] = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_TASK_GETED, []);
            let aGeted: number[] = all[All_DAY_TEMP.every_day_task_geted] || [];

            item["canGet"] = progress >= item.conditionValue;
            item["geted"] = aGeted ? aGeted.includes(item.id) : false;
            if (item.id == 1) {
                item["canGet"] = progress < item.conditionValue;
            }
            item["progress"] = progress;
            dataList.push(item);
        })
        // _LOG("getEveryDayTask", dataList);
        return dataList;
    }

    public getEveryDayTaskReward(id, callback) {
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        // let aGeted: number[] = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_TASK_GETED, []);
        let aGeted: number[] = all[All_DAY_TEMP.every_day_task_geted] || [];

        if (id == 1) {
            let videoTask = this.findEvreyDayTaskById(id);
            let progress = CountManager.inst.findEveryDayLookVideoCount();
            if (progress < videoTask.conditionValue) {
                //TODO SDK 领取奖励(直接领取 看视频领取) 
                Ad.playVideoAd(() => {
                    CountManager.inst.setEveryDayLookVideoCount();
                    if (progress + 1 >= videoTask.conditionValue) {
                        aGeted.push(id);
                        all[All_DAY_TEMP.every_day_task_geted] = aGeted;
                        GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);
                    }
                    callback();

                })
                return;
            }
        }
        if (!aGeted.includes(id)) {
            aGeted.push(id);
            // GameStorage.setJson(STORAGE_KEY.EVERY_DAY_TASK_GETED, aGeted);
            all[All_DAY_TEMP.every_day_task_geted] = aGeted;
            GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);
            if (callback) {
                callback();
            }
        } else {
            console.error("已经领取过")
        }
    }

    public getAchievement() {
        this.formatAchievementConfig();
        let dataList = [];
        this.achievementConfigList.forEach((item: any[], index) => {
            let progress = 0;
            switch (index) {
                case 1:
                    progress = CountManager.inst.findServiceCount();
                    break;
                case 3:
                    progress = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS, []).length;
                    break;
                case 4:
                    progress = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES, []).length;
                    break;
                case 5:
                    progress = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []).length;
                    break;
                case 6: //看视频
                    progress = CountManager.inst.findLookVideoCount();
                    break;
            }

            let _item = null;
            for (let i = 0; i < item.length; i++) {
                const element = item[i];
                if (!element.geted) {
                    _item = element;
                    if (progress >= element.conditionValue) {
                        _item["canGet"] = true;
                    }
                    _item["progress"] = progress;
                    break;
                }
            }
            dataList.push(_item);
        })
        // _LOG("getAchievement", dataList);
        return dataList;
    }

    public getAchievementReward(id, callback) {
        let aGeted: number[] = GameStorage.getJson(STORAGE_KEY.ACHEVEMENT_GETED, []);
        if (!aGeted.includes(id)) {
            aGeted.push(id);
            GameStorage.setJson(STORAGE_KEY.ACHEVEMENT_GETED, aGeted);
            if (callback) {
                callback();
            }
        } else {
            console.error("已经领取过")
        }
    }

    private formatAchievementConfig() {
        let achievementConfig: any[] = Global.localConfig[LOCAL_CONFIG.AchievementConfig];
        let aGeted: number[] = GameStorage.getJson(STORAGE_KEY.ACHEVEMENT_GETED, []);

        for (let i = 0; i < achievementConfig.length; i++) {
            const element = achievementConfig[i];
            element["geted"] = aGeted.includes(element.id);
            element["canGet"] = false;

            if (!this.achievementConfigList[element.conditionKey]) {
                this.achievementConfigList[element.conditionKey] = [];
            }
            this.achievementConfigList[element.conditionKey].push(element);
        }
        // _LOG("this.achievementConfigList", this.achievementConfigList);
    }

    private findEvreyDayTaskById(id) {
        let evreyDayTaskConfig: any[] = Global.localConfig[LOCAL_CONFIG.EveryDayTaskConfig];
        for (let i = 0; i < evreyDayTaskConfig.length; i++) {
            const element = evreyDayTaskConfig[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

}
