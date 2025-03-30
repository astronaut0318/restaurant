import { api } from "../../api/api";
import { EVENT_TAG, LOCAL_CONFIG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import TaskGuideManager from "../Hall/TaskGuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertGuide extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    taskTitle: cc.Label = null;

    @property(cc.Label)
    taskDes: cc.Label = null;

    @property(cc.Label)
    jiangli: cc.Label = null;

    @property(cc.Node)
    btnGet: cc.Node = null;

    @property(cc.Node)
    btnGo: cc.Node = null;

    private _data = null;

    init(data) {
        this._data = data;
    }

    onOpen() {
        this.getGuideData();
    }

    onDestroy() {
        main.emit(EVENT_TAG.UPDATE_UN_LOCK_COOK_WOMAN);
    }

    private getGuideData() {
        this.btnGo.active = false;
        this.btnGet.active = false;

        this._data = TaskGuideManager.inst.getGuide();
        _LOG("当前任务", this._data);

        let { taskName, conditionInfo, rewardMoney, isok, conditionValue, condition_value2 } = this._data;
        this.title.string = taskName + "";
        this.taskTitle.string = conditionInfo + "";
        this.taskDes.string = "任务进度：" + condition_value2 + "/" + conditionValue;
        this.jiangli.string = "+" + rewardMoney;
        if (!isok) {
            this.btnGo.active = true;
        } else {
            this.btnGet.active = true;
        }
    }

    onClickGet() {
        TaskGuideManager.inst.getReward(this._data.id);
        uiManager.close(this);
    }

    // * 引导任务类型
    // * 1.购买吧台、桌子
    // * 2.购买装饰地毯等7-12类型
    // * 5.解锁菜谱
    // * 7.解锁厨娘
    // * 8.升级厨娘
    // * 9.一键揽客次数
    // * 10.累计收益翻倍次数
    // * 11.自动服务次数
    // */
    onClickGo() {
        let { conditionType, detailInfo } = this._data;
        uiManager.close(this);

        switch (conditionType) {
            case 1:
            case 2:
                uiManager.showWindow(UIID.RenovationItemDetail, detailInfo);
                break;
            case 5:
                uiManager.showWindow(UIID.CaipuItemDetail, detailInfo);
                break;
            case 7:
            case 8:
                uiManager.showWindow(UIID.ChuniangDetail, detailInfo);
                break;
            case 9:
                uiManager.showWindow(UIID.AlertQuickKeren);
                break;
            case 10:
                uiManager.showWindow(UIID.AlertChiHuoJie);
                break;
            case 11:
                if (Global.autoFuwuOpen) {
                    uiManager.open(UIID.Toast, {
                        title: "自动服务已开启"
                    })
                    return;
                }
                uiManager.showWindow(UIID.AlertAutoFuWu);
                break;
        }
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}