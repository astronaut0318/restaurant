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
export default class CaipuItemDetail extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    describe: cc.Label = null;

    @property(cc.Label)
    num_1: cc.Label = null;

    @property(cc.Label)
    time1: cc.Label = null;

    @property(cc.Label)
    shouru1: cc.Label = null;

    @property(cc.Node)
    redBtn: cc.Node = null;

    @property(cc.Node)
    grayBtn: cc.Node = null;

    @property(cc.Label)
    redBtnLabel: cc.Label = null;

    @property(cc.Node)
    foodNode: cc.Node = null;

    @property(cc.Label)
    time2_1: cc.Label = null;

    @property(cc.Label)
    time2_2: cc.Label = null;

    @property(cc.Label)
    shouru2_1: cc.Label = null;

    @property(cc.Label)
    shouru2_2: cc.Label = null;

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
        let { id, chineseName, chineseDesp, unlock, canUpgrade, lastUpgradeData, upgradeData, showBuy } = this._data;
        let { cookTime, sellPrice, needMoney } = upgradeData;

        this.title.string = chineseName + "";
        this.describe.string = chineseDesp + "";

        Utils.loadLocalSprite("texture/foods/shuwu" + id, this.foodNode.getComponent(cc.Sprite));
        // 
        if (unlock && !canUpgrade) {
            this.grayBtn.active = true;
            this.jeisuoNode.active = true;
            this.time1.string = "制作所需时间：" + cookTime + "秒";
            this.shouru1.string = "每份卖出收入：" + sellPrice;
        } else if (unlock && canUpgrade) {
            this.shengjiNode.active = true;
            this.redBtn.active = true;
            this.redBtnLabel.string = needMoney + " 升级";
            this.subNum = needMoney;

            this.time2_1.string = "做菜速度：" + lastUpgradeData.cookTime + "秒";
            this.shouru2_1.string = "每份收入：" + lastUpgradeData.sellPrice;

            this.time2_2.string = "做菜速度：" + cookTime + "秒";
            this.shouru2_2.string = "每份收入：" + sellPrice;
        } else if (showBuy) {
            this.jeisuoNode.active = true;
            this.redBtn.active = true;
            this.redBtnLabel.string = needMoney + " 解锁";
            this.subNum = needMoney;

            this.time1.string = "制作所需时间：" + cookTime + "秒";
            this.shouru1.string = "每份卖出收入：" + sellPrice;
        }
    }

    onClickLockAndUpgrade() {
        let { unlock, id } = this._data;

        main.emit(EVENT_TAG.SUB_MONEY, this.subNum, () => {
            if (!unlock) {
                Utils.unlockFood(id);
            } else {
                Utils.upgradeFood(id);
            }
            main.emit(EVENT_TAG.UPDATE_SHOP_MANAGER_C);
            main.emit(EVENT_TAG.UPDATE_GUIDE);
            main.emit(EVENT_TAG.UPDATE_UNLOCK_FOODS);
            uiManager.close(this);
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }
}