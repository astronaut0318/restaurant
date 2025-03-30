import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import Http from "../../utils/Http";
import ShopLevelManager from "../Hall/ShopLevelManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopUpItem extends cc.Component {

    @property(cc.Label)
    shopLevel: cc.Label = null;

    @property(cc.RichText)
    des: cc.RichText = null;

    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;

    @property(cc.Label)
    barLabel: cc.Label = null;

    @property(cc.Label)
    rewardNum: cc.Label = null;

    @property(cc.Node)
    jinxingzhong: cc.Node = null;

    @property(cc.Node)
    yilingqu: cc.Node = null;

    @property(cc.Node)
    lingqu: cc.Node = null;

    private _data = null;

    start() {

    }

    public setData(data, idx) {
        this.reset();
        if (data) {
            this._data = data;
            let { shopLevel, commonCashMoney, needCustomer, progress, canGet, geted, diff } = data;
            this.shopLevel.string = shopLevel + "级饭店";

            this.setProgress(progress, needCustomer);
            this.rewardNum.string = commonCashMoney / 10000 + "元";
            if (canGet && geted) {
                this.setRichLabel("恭喜升级到", shopLevel + "级饭店，", "可领奖");
                this.yilingqu.active = true;
            } else if (canGet && !geted) {
                this.lingqu.active = true;
                this.setRichLabel("恭喜升级到", shopLevel + "级饭店，", "可领奖");
            } else {
                this.jinxingzhong.active = true;
                this.setRichLabel("还差", diff + "个客人", "即可领取奖励");
            }
        }

        // uiManager.showWindow(UIID.AlertShopUpReward, {
        //     num: 5*10000,
        // })
    }

    private reset() {
        this.yilingqu.active = false;
        this.lingqu.active = false;
        this.jinxingzhong.active = false;
        this.bar.progress = 0;
    }

    private setRichLabel(a, b, c) {
        this.des.string = `<color=#845542>${a}</c><color=#ff2a2b>${b}</color><color=#845542>${c}</c>`
    }

    public setProgress(completedCount: number, totalCount: number) {
        let current = completedCount / totalCount;
        this.barLabel.string = completedCount + "/" + totalCount;
        if (current < 0.1 && current !== 0) current = 0.1;
        this.bar.progress = current
    }

    public onClickGet() {
        let { id, commonCashMoney } = this._data;
        ShopLevelManager.inst.getShopLevelReward(id, (isOk) => {
            if(isOk==true) {
                main.emit(EVENT_TAG.ADD_FLY_RED_PACK, commonCashMoney);
                main.emit(EVENT_TAG.UPDATE_SHOPUP_LIST);
                uiManager.showWindow(UIID.AlertShopUpReward, {
                    num: commonCashMoney,
                })
            } 
        })
    }

    // update (dt) {}
}
