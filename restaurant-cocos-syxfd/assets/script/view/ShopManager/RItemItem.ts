import { api } from "../../api/api";
import { STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import GameStorage from "../../utils/GameStorage";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RItemItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    bataiNode: cc.Node = null;

    @property(cc.Node)
    tableNode: cc.Node = null;

    @property(cc.Node)
    ditanNode: cc.Node = null;

    @property(cc.Node)
    peishiNode: cc.Node = null;

    @property(cc.Node)
    buyNode: cc.Node = null;

    @property(cc.Node)
    yishiyong: cc.Node = null;

    @property(cc.Node)
    yigoumai: cc.Node = null;

    @property(cc.Node)
    weijiesuo: cc.Node = null;

    @property(cc.Node)
    zhezhao: cc.Node = null;

    @property(cc.Label)
    buyLabel: cc.Label = null;

    private _data: any = null;

    start() {

    }

    private reset() {
        this.title.string = "";
        this.bataiNode.active = false;
        this.tableNode.active = false
        this.ditanNode.active = false
        this.peishiNode.active = false
        this.buyNode.active = false
        this.yishiyong.active = false
        this.yigoumai.active = false
        this.weijiesuo.active = false
        this.zhezhao.active = false
    }

    public setData(data, idx) {
        this.reset();
        this._data = data;
        this._data["idx"] = idx;
        if (this._data) {
            let { type, chineseName, unlock, isUse, showBuy, needMoney } = this._data;
            this.title.string = chineseName + "";
            this.setSpite(type, idx);

            // 已购买
            if (unlock && !isUse) {
                this.yigoumai.active = true;
            }
            // 已使用
            else if (isUse) {
                this.yishiyong.active = true;
            }
            // 购买按钮
            else if (showBuy) {
                this.buyNode.active = true;
                this.buyLabel.string = needMoney + "";
            }
            // 未解锁
            else if (!unlock) {
                this.zhezhao.active = true;
                this.weijiesuo.active = true;
            }
        }

        // this.node.on(cc.Node.EventType.TOUCH_START, this.onClickShowDetail, this);
    }

    // 装修类型0吧台1-6对应1-6号桌7迎宾地垫8绿植9鲜花10招财摆件11灶王爷12生肖摆件
    private setSpite(type: number, idx: number) {
        let path = ""
        let spriteNode: cc.Node = null;
        switch (type) {
            case 0:
                spriteNode = this.bataiNode;
                path = "texture/batai/bar_";
                break;
            case 1:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 2:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 3:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 4:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 5:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 6:
                spriteNode = this.tableNode;
                path = "texture/table_icon/zhuozi";
                break;
            case 7:
                spriteNode = this.ditanNode;
                path = "texture/ditan/ditan";
                break;
            case 8:
                spriteNode = this.peishiNode;
                path = "texture/peijian/lvzhi";
                break;
            case 9:
                spriteNode = this.peishiNode;
                path = "texture/peijian/xianhua";
                break;
            case 10:
                spriteNode = this.peishiNode;
                path = "texture/peijian/zhaocai";
                break;
            case 11:
                spriteNode = this.peishiNode;
                path = "texture/peijian/zaowangye";
                break;
            case 12:
                spriteNode = this.peishiNode;
                path = "texture/peijian/shengxiao";
                break;
        }

        spriteNode.active = true;
        Utils.loadLocalSprite(path + (idx + 1), spriteNode.getComponent(cc.Sprite));
    }

    public onClickShowDetail() {
        if (this.weijiesuo.active) return;
        uiManager.showWindow(UIID.RenovationItemDetail, this._data);
    }

    // update (dt) {}
}
