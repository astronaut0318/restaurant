import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShopUpReward extends UIView {
    @property(cc.Label)
    num: cc.Label = null;

    @property(cc.Label)
    des: cc.Label = null;

    private _data = null;

    init(data) {
        this._data = data;
    }

    onOpen() {
        this.num.string = this._data["num"] + "";
        this.des.string = `约${this._data["num"] / 10000}元`;
    }

    onCliclTixian() {
        uiManager.close(this);
        uiManager.open(UIID.AlertWallet);
    }

    onClickClose() {
        uiManager.close(this);
    }

    onDestroy() {

    }



}