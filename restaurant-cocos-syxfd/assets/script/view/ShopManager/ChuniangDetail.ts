import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChuniangDetail extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    describe: cc.Label = null;

    @property(cc.Label)
    speed1: cc.Label = null;

    @property(cc.Label)
    shouru1: cc.Label = null;

    @property(cc.Label)
    speed2_1: cc.Label = null;

    @property(cc.Label)
    speed2_2: cc.Label = null;

    @property(cc.Label)
    shouru2_1: cc.Label = null;

    @property(cc.Label)
    shouru2_2: cc.Label = null;

    @property(cc.Node)
    redBtn: cc.Node = null;

    @property(cc.Node)
    grayBtn: cc.Node = null;

    @property(cc.Label)
    redBtnLabel: cc.Label = null;

    @property([cc.Node])
    icons: cc.Node[] = [];

    @property(cc.Node)
    jeisuoNode: cc.Node = null;

    @property(cc.Node)
    shengjiNode: cc.Node = null;

    private _data: any = null;

    private subNum = 0;

    init(data) {
        this._data = data;
    }

    onOpen() {
        let { chineseName, chineseDesp, unlock, canUpgrade, upgradeData, lastUpgradeData, lvl, id } = this._data;
        let { needMoney, speedBonus } = upgradeData;

        this.title.string = chineseName + " Lv." + lvl;
        this.describe.string = chineseDesp + "";

        let idx = id - 2;
        this.icons[idx].active = true;
        // 
        if (!unlock) {
            this.jeisuoNode.active = true;
            this.redBtn.active = true;
            this.redBtnLabel.string = needMoney + " 解锁";
            this.subNum = needMoney;
            this.speed1.string = "做菜速度：" + speedBonus + "%";
            this.speed2_2.string = "做菜速度：" + speedBonus + "%";
        } else if (unlock && !canUpgrade) {
            this.grayBtn.active = true;
            this.jeisuoNode.active = true;
            this.speed1.string = "做菜速度：" + speedBonus + "%";
        } else if (unlock) {
            this.shengjiNode.active = true;
            this.redBtn.active = true;
            this.redBtnLabel.string = needMoney + " 升级";
            this.subNum = needMoney;

            this.speed2_1.string = "做菜速度：" + lastUpgradeData.speedBonus + "%";
            this.speed2_2.string = "做菜速度：" + speedBonus + "%";

        }
    }

    onClickLockAndUpgrade() {
        let { unlock, id } = this._data;

        main.emit(EVENT_TAG.SUB_MONEY, this.subNum, () => {
            if (!unlock) {
                Utils.unlockCookWoman(id);
            } else {
                Utils.upgradeCookWoman(id);
            }
            main.emit(EVENT_TAG.UPDATE_SHOP_MANAGER_C_N);
            main.emit(EVENT_TAG.UPDATE_GUIDE);
            main.emit(EVENT_TAG.UPDATE_UN_LOCK_COOK_WOMAN);
            uiManager.close(this);
        });

    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}