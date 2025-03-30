import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import Http from "../../utils/Http";
import TaskManager from "../Hall/TaskManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChengjIuItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    jinduLabel: cc.Label = null;

    @property(cc.ProgressBar)
    jindutiao: cc.ProgressBar = null;

    @property(cc.Node)
    jinxingzhong: cc.Node = null;

    @property(cc.Node)
    chaopiao: cc.Node = null;

    @property(cc.Node)
    hongbao: cc.Node = null;

    @property(cc.Label)
    jiangli: cc.Label = null;

    @property(cc.Node)
    lqBtnNode: cc.Node = null;

    @property(cc.Button)
    lqBtn: cc.Button = null;

    @property(cc.Label)
    lqBtnLabel: cc.Label = null;

    private _data: any;

    private reset() {
        this.jinduLabel.string = ``;
        this.jindutiao.progress = 0;
        this.chaopiao.active = false;
        this.hongbao.active = false
        this.lqBtnNode.active = false;
    }

    public setData(data) {
        this.reset();

        if (data) {
            this._data = data;
            let { info, progress, conditionValue, canGet, geted, rewardType, rewardValue } = data;

            this.title.string = info;
            this.setProgress(progress, conditionValue);
            if (canGet && !geted) {
                this.lqBtnNode.active = true;
            } else if (geted) {
                this.lqBtnNode.active = true;
                this.lqBtn.interactable = false;
                this.lqBtn.enabled = false;
                this.lqBtnLabel.string = "明日再来";
            }

            // 完成所有 领取红包
            if (rewardType == 1) {
                this.chaopiao.active = true;
                this.hongbao.active = false
            } else {
                this.chaopiao.active = false;
                this.hongbao.active = true
            }

            this.jiangli.string = "+" + rewardValue;
        }
    }

    onClickGetReward() {
        let { id, rewardValue } = this._data;
        TaskManager.inst.getAchievementReward(id, () => {
            uiManager.open(UIID.Toast, {
                title: "领取成功"
            })
            main.emit(EVENT_TAG.ADD_FLY_MONEY, rewardValue);
            main.emit(EVENT_TAG.UPDATE_CHENGJIU);
        })
    }

    private setProgress(completedCount: number, totalCount: number) {
        let current = completedCount / totalCount;
        if (current < 0.1 && current !== 0) current = 0.1;
        this.jinduLabel.string = `${completedCount}/${totalCount}`;
        this.jindutiao.progress = current;
    }

    // update (dt) {}
}
