import { api } from "../../api/api";
import { EVENT_TAG, LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Http from "../../utils/Http";
import CountManager from "../Hall/CountManager";
import ClockMakingMoneyItem from "./ClockMakingMoneyItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMakingMoney extends cc.Component {
    @property(List)
    list: List = null;

    @property(cc.Label)
    dakaCount: cc.Label = null;

    @property(cc.Label)
    yijianlankeCount: cc.Label = null;

    private _data: any[] = null;

    private time = 0.3;

    start() {
        this.node.zIndex = 9999;
        this.node.x = cc.winSize.width;
        main.on(EVENT_TAG.GET_DAKA_LIST, this.getDakaList, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.GET_DAKA_LIST, this.getDakaList, this);
    }

    open() {
        this.node.active = true;
        cc.tween(this.node).to(this.time, {
            x: 0
        }).start();
        this.getDakaList();
    }

    private getDakaList() {
        let makingCount = CountManager.inst.findMakingCount();
        if (makingCount < 10) {
            makingCount = "0" + makingCount;
        }
        this.dakaCount.string = makingCount + "";
        let ClockInMakingMoney = Global.localConfig[LOCAL_CONFIG.ClockInMakingMoney];
        console.log("ClockInMakingMoney",ClockInMakingMoney)
        ClockInMakingMoney.forEach(element => {
            let count = CountManager.inst.findMakingCount()
            element["count"] = count;
            element["canGet"] = count >= element.needDay;
            element["geted"] = this.findGetRewardById(element.id);

            if (element["geted"]) {
                element["count"] = element.needDay;
                element["canGet"] = false;
            }
        });

        _LOG("打卡数据", ClockInMakingMoney);
        this._data = ClockInMakingMoney;
        this.list.numItems = this._data.length;

        let count = CountManager.inst.findEveryDayQuikCustomerCount();
        if (count >= Global.everyMakeNeedNum) {
            count = Global.everyMakeNeedNum;
        }
        this.yijianlankeCount.string = `(使用一键揽客${count}/${Global.everyMakeNeedNum}次)`;
    }

    private findGetRewardById(id) {
        let geted = false;
        let getClockMaking = GameStorage.getJson(STORAGE_KEY.GET_CLOCK_MAKING_MONEY, {});
        if (getClockMaking[id]) {
            geted = true;
        }
        return geted;
    }

    public static getRewardById(id, callback) {
        let getClockMaking = GameStorage.getJson(STORAGE_KEY.GET_CLOCK_MAKING_MONEY, {});
        if (getClockMaking[id]) {
            uiManager.open(UIID.Toast, {
                title: "已领取"
            })
        } else {
            getClockMaking[id] = true;
            GameStorage.setJson(STORAGE_KEY.GET_CLOCK_MAKING_MONEY, getClockMaking);
            callback && callback();
        }
    }

    onListRender(item: cc.Node, idx: number) {
        let script = item.getComponent(ClockMakingMoneyItem);
        script.setData(this._data[idx]);
    }

    onClickClose() {
        cc.tween(this.node).to(this.time, {
            x: cc.winSize.width
        }).start().call(() => {
            this.node.active = false;
        });
    }

    onClickHelp() {
        uiManager.showWindow(UIID.AlertDakaguize);
    }
}