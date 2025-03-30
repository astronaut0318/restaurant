import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import ShopLevelManager from "../Hall/ShopLevelManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShopUpLvl extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    private lv = null;

    private _data = null

    init(lv) {
        this.lv = lv;
    }

    onOpen() {
        this.title.string = this.lv + "级饭店";

        this._data = ShopLevelManager.inst.findShopLevelRewardByShopLvl(this.lv);
    }

    onDestroy() {
    }

    onClickGet() {
        if (!this._data) {
            return;
        }
        let { id, commonCashMoney } = this._data;
        ShopLevelManager.inst.getShopLevelReward(id, (isOk) => {
            uiManager.close(this);
            if(isOk==true) {
                main.emit(EVENT_TAG.ADD_FLY_RED_PACK, commonCashMoney);
                main.emit(EVENT_TAG.UPDATE_SHOPUP_LIST);
                uiManager.showWindow(UIID.AlertShopUpReward, {
                    num: commonCashMoney,
                })
            }
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}