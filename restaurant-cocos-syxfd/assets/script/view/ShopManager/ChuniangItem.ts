import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChuniangItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property([cc.Node])
    chuniangs: cc.Node[] = [];

    @property(cc.Node)
    keShengji: cc.Node = null;

    @property(cc.Node)
    jiesuo: cc.Node = null;

    @property(cc.Label)
    jiesuoLabel: cc.Label = null;

    @property(cc.Node)
    shiyongzhong: cc.Node = null;

    private _data = {};

    start() {

    }

    private reset() {
        this.keShengji.active = false;
        this.jiesuo.active = false;
        this.jiesuoLabel.string = "";
        this.shiyongzhong.active = false;
    }

    setData(data, idx: number) {
        this.reset();
        this._data = data;
        this._data["idx"] = idx;
        let { chineseName, unlock, canUpgrade, upgradeData, lastUpgradeData, lvl } = data;
        let { needMoney } = upgradeData;

        this.title.string = chineseName + " Lv." + lvl;
        this.chuniangs[idx].active = true;
        if (!canUpgrade && unlock) {
            this.shiyongzhong.active = true;
        } else if (unlock) {
            this.keShengji.active = true;
        } else {
            this.jiesuo.active = true;
            this.jiesuoLabel.string = needMoney + "";
        }
    }

    public onClickShowDetail() {
        uiManager.showWindow(UIID.ChuniangDetail, this._data);
    }

    // update (dt) {}
}
