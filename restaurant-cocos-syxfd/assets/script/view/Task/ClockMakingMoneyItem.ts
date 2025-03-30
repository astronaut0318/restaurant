import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import Http from "../../utils/Http";
import ClockMakingMoney from "./ClockMakingMoney";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockMakingMoneyItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    jinduLabel: cc.Label = null;

    @property(cc.ProgressBar)
    jindutiao: cc.ProgressBar = null;

    @property(cc.Label)
    hongbao: cc.Label = null;

    @property(cc.Button)
    btn: cc.Button = null;

    private _data = null;

    private reset() {
        this.jinduLabel.string = ``;
        this.jindutiao.progress = 0;
        this.btn.interactable = true;
    }

    public setData(data) {
        this.reset();
        if (data) {
            this._data = data;
            let { title, count, needDay, rewardMoney, geted } = data;
            this.title.string = title + "";
            this.setProgress(count, needDay);
            this.hongbao.string = rewardMoney / 10000 + "元";
            if (geted) {
                this.btn.interactable = false;
            }
        }
    }

    private setProgress(completedCount: number, totalCount: number) {
        if (completedCount >= totalCount) {
            completedCount = totalCount;
        }
        let current = completedCount / totalCount;
        if (current < 0.1 && current !== 0) current = 0.05;
        this.jinduLabel.string = `${completedCount}/${totalCount}`;
        this.jindutiao.progress = current;
    }

    onClickGet() {
        let { geted, canGet, id, rewardMoney } = this._data;

        if (!geted && !canGet) {
            uiManager.open(UIID.Toast, {
                title: "打卡天数不足，继续努力哦~"
            })
            return;
        }

        ClockMakingMoney.getRewardById(id, () => {
            main.emit(EVENT_TAG.GET_DAKA_LIST);
            main.emit(EVENT_TAG.ADD_FLY_RED_PACK, rewardMoney, null, false);
            uiManager.showWindow(UIID.AlertShopUpReward, {
                num: rewardMoney,
            })
        })

    }

    // update (dt) {}
}
