import { All_DAY_TEMP, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CountManager extends cc.Component {

    private static _instance: CountManager = null
    public static get inst(): CountManager {
        return this._instance || (this._instance = new CountManager())
    }

    public setServiceCount(_count = 1) {
        let count = this.findServiceCount();
        count += _count;
        GameStorage.setInt(STORAGE_KEY.SERVICE_COUNT, count);

        let countEveryDay = this.findEveryDayServiceCount();
        countEveryDay += _count;
        // GameStorage.setInt(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, countEveryDay);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, {});
        all[All_DAY_TEMP.every_day_service_count] = countEveryDay;
        GameStorage.setJson(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, all);
    }

    public findServiceCount() {
        return GameStorage.getInt(STORAGE_KEY.SERVICE_COUNT, 0);
    }

    public findEveryDayServiceCount() {
        // return GameStorage.getInt(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, 0);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, {});
        return all[All_DAY_TEMP.every_day_service_count] || 0;
    }

    public setQuikCustomerCount(_count = 1) {
        let count = this.findQuikCustomerCount();
        count += _count;
        GameStorage.setInt(STORAGE_KEY.TASK_GUIDE_QUIK, count);

        let countEveryDay = this.findEveryDayQuikCustomerCount();
        countEveryDay += _count;
        // GameStorage.setInt(STORAGE_KEY.EVERY_DAY_TASK_QUIK, countEveryDay);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        all[All_DAY_TEMP.every_day_task_quik] = countEveryDay;
        GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);

        // 打卡天数
        if (countEveryDay >= Global.everyMakeNeedNum) {
            this.setMakingCount();
        }
    }

    public findQuikCustomerCount() {
        return GameStorage.getInt(STORAGE_KEY.TASK_GUIDE_QUIK, 0);
    }

    public findEveryDayQuikCustomerCount() {
        // return GameStorage.getInt(STORAGE_KEY.EVERY_DAY_TASK_QUIK, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        return all[All_DAY_TEMP.every_day_task_quik] || 0;
    }

    private setMakingCount() {
        let clockmakingdata = GameStorage.getJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT);
        let nowdata = {
            time: Utils.getFormatDate(),
            count: 0,
        }
        if (!clockmakingdata) {
            nowdata.count += 1;
            GameStorage.setJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT, nowdata);
        } else {
            if (clockmakingdata.time) {
                let diff = Utils.getNumberOfDays(clockmakingdata.time, nowdata.time);
                if (diff == 0) {

                } else if (diff == 1) {
                    nowdata.count = clockmakingdata.count;
                    nowdata.count += 1;
                    GameStorage.setJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT, nowdata);
                } else {
                    nowdata.count += 1;
                    GameStorage.setJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT, nowdata);
                }
            } else {
                nowdata.count += 1;
                GameStorage.setJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT, nowdata);
            }
        }
    }

    public checkMakingCount() {
        let clockmakingdata = GameStorage.getJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT);
        if (clockmakingdata) {
            let nowdata = {
                time: Utils.getFormatDate(),
                count: 0,
            }
            let diff = Utils.getNumberOfDays(clockmakingdata.time, nowdata.time);
            if (diff > 1) {
                GameStorage.remove(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT);
            }
        }
    }

    public findMakingCount(): any {
        let clockmakingdata = GameStorage.getJson(STORAGE_KEY.CLOCK_MAKING_MONEY_CNT);
        let cnt = clockmakingdata ? clockmakingdata.count : 0;
        return cnt;
        // return 30;
    }

    public setLoginDayCount() {
        let loginDayData = GameStorage.getJson(STORAGE_KEY.LOGIN_DAY);
        if (loginDayData) {
            let nowTime = Utils.getFormatDate();
            let diff = Utils.getNumberOfDays(loginDayData.time, nowTime);
            if (diff > 1) {
                GameStorage.setJson(STORAGE_KEY.LOGIN_DAY, {
                    time: nowTime,
                    count: loginDayData.count += 1,
                });
            }
        } else {
            //初始数据
            GameStorage.setJson(STORAGE_KEY.LOGIN_DAY, {
                time: Utils.getFormatDate(),
                count: 1,
            });
        }
    }

    public findLoginDayCount(): any {
        let loginDayData = GameStorage.getJson(STORAGE_KEY.LOGIN_DAY);
        let cnt = loginDayData ? loginDayData.count : 0;
        return cnt;
    }

    public setDoubleIncomeCount(_count = 1) {
        let count = this.findDoubleIncomeCount();
        count += _count;
        GameStorage.setInt(STORAGE_KEY.TASK_GUIDE_DOUBLE_INCOME, count);
    }

    public findDoubleIncomeCount() {
        return GameStorage.getInt(STORAGE_KEY.TASK_GUIDE_DOUBLE_INCOME, 0);
    }

    public setAutoServiceCount(_count = 1) {
        let count = this.findAutoServiceCount();
        count += _count;
        GameStorage.setInt(STORAGE_KEY.TASK_GUIDE_AUTO_SERVICE, count);
    }

    public findAutoServiceCount() {
        return GameStorage.getInt(STORAGE_KEY.TASK_GUIDE_AUTO_SERVICE, 0);
    }

    public setLookVideoCount(_count = 1) {
        let count = this.findLookVideoCount();
        count += _count;
        GameStorage.setInt(STORAGE_KEY.LOOK_VIDEO, count);
    }

    public findLookVideoCount() {
        return GameStorage.getInt(STORAGE_KEY.LOOK_VIDEO, 0);
    }

    public setEveryDayLookVideoCount(_count = 1) {
        this.setLookVideoCount(_count);

        let countEveryDay = this.findEveryDayLookVideoCount();
        countEveryDay += _count;
        // GameStorage.setInt(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, countEveryDay);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, {});
        all[All_DAY_TEMP.every_day_look_viedo] = countEveryDay;
        GameStorage.setJson(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, all);
    }

    public findEveryDayLookVideoCount() {
        // return GameStorage.getInt(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, 0);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, {});
        return all[All_DAY_TEMP.every_day_look_viedo] || 0;
    }

    public setEveryDayTuhaoCount(_count = 1) {
        let count = this.findEveryDayTuhaoCount();
        count += _count;
        // GameStorage.setInt(STORAGE_KEY.EVERY_DAY_TUHAO, count);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_TUHAO, {});
        all[All_DAY_TEMP.every_day_tuhao] = count;
        GameStorage.setJson(STORAGE_KEY.EVERY_DAY_TUHAO, all);
    }

    public findEveryDayTuhaoCount() {
        // return GameStorage.getInt(STORAGE_KEY.EVERY_DAY_TUHAO, 0);
        let all = GameStorage.getJson(STORAGE_KEY.EVERY_DAY_TUHAO, {});
        return all[All_DAY_TEMP.every_day_tuhao] || 0;
    }

    public setEveryDayGetIncome(_count = 1) {
        let count = this.findEveryDayGetIncome();
        count += _count;
        // GameStorage.setInt(STORAGE_KEY.EVERY_DAY_GET_INCOME, count);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        all[All_DAY_TEMP.every_day_get_income] = count;
        GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);
    }

    public findEveryDayGetIncome() {
        // return GameStorage.getInt(STORAGE_KEY.EVERY_DAY_GET_INCOME, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        return all[All_DAY_TEMP.every_day_get_income] || 0;
    }


}
