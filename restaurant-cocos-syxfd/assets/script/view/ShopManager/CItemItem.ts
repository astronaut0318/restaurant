import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CItemItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Sprite)
    shiwuSprite: cc.Sprite = null;

    @property(cc.Node)
    buy: cc.Node = null;

    @property(cc.Node)
    up: cc.Node = null;

    @property(cc.Node)
    yigoumai: cc.Node = null;

    @property(cc.Node)
    jiantou: cc.Node = null;

    @property(cc.Node)
    zhezhao: cc.Node = null;

    @property(cc.Node)
    weijiesuo: cc.Node = null;

    private _data: any = null;

    // onLoad () {}

    start() {

    }

    private reset() {
        this.yigoumai.active = false;
        this.up.active = false;
        this.jiantou.active = false;
        this.buy.active = false;
        this.zhezhao.active = false;
        this.weijiesuo.active = false;
    }

    setData(data) {
        this.reset();
        this._data = data;
        if (this._data) {
            let { id, chineseName, unlock, canUpgrade, upgradeData, showBuy } = this._data;
            Utils.loadLocalSprite("texture/foods/shuwu" + id, this.shiwuSprite)
            this.title.string = chineseName + "";

            if (unlock && !canUpgrade) {
                this.yigoumai.active = true;
            } else if (unlock && canUpgrade) {
                this.up.active = true;
                this.jiantou.active = true;
            } else if (showBuy) {
                this.buy.active = true;
                this.buy.getChildByName("Label").getComponent(cc.Label).string = upgradeData.needMoney + "";
            } else {
                this.title.string = "???";
                this.zhezhao.active = true;
                this.weijiesuo.active = true;
            }
        }
    }

    public onClickShowDetail() {
        if (this.weijiesuo.active) return;
        uiManager.showWindow(UIID.CaipuItemDetail, this._data);
    }

    // update (dt) {}
}
