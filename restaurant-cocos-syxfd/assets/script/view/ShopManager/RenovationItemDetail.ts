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
export default class RenovationItemDetail extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    describe: cc.Label = null;

    @property(cc.Label)
    jianglihongbao_num: cc.Label = null;

    @property(cc.Label)
    chongzhishangxian_num: cc.Label = null;

    @property(cc.Node)
    redBtn: cc.Node = null;

    @property(cc.Node)
    yellowBtn: cc.Node = null;

    @property(cc.Node)
    grayBtn: cc.Node = null;

    @property(cc.Label)
    redBtnLabel: cc.Label = null;

    @property(cc.Node)
    bataiNode: cc.Node = null;

    @property(cc.Node)
    tableNode: cc.Node = null;

    @property(cc.Node)
    ditanNode: cc.Node = null;

    @property(cc.Node)
    peishiNode: cc.Node = null;

    private _data: any = null;

    init(data) {
        this._data = data;
    }

    onOpen() {
        let { chineseName, description, type, barMaxProfit, tipAdd, id, isUse, unlock, showBuy, needMoney } = this._data;
        this.title.string = chineseName + "";
        this.describe.string = description + "";
        if (type == 0) {
            this.chongzhishangxian_num.string = "充值上限：" + barMaxProfit;
        } else {
            this.chongzhishangxian_num.string = "每分钟充值收入：" + tipAdd * 60;
        }
        this.setSpite(type, id % 10);
        if (isUse) {
            this.grayBtn.active = true;
        } else if (unlock) {
            this.yellowBtn.active = true;
        } else if (showBuy) {
            this.redBtn.active = true;
            this.redBtnLabel.string = needMoney + " 购买";
        }
    }

    onClickBuy() {
        let { type, id, needMoney } = this._data;
        main.emit(EVENT_TAG.SUB_MONEY, needMoney, () => {
            if (type < 7) {
                Utils.unlockTable(id);
            } else {
                Utils.unlockDecoration(id);
            }
            this.onClickUse();
        })
    }

    onClickUse() {
        let { type, id, isGuide } = this._data;
        if (type < 7) {
            Utils.useTable(type, id);
        } else {
            Utils.useDecoration(type - 7, id);
        }
        uiManager.close(this);
        main.emit(EVENT_TAG.UPDATE_SHOP_MANAGER_R);
        if (isGuide) {
            main.emit(EVENT_TAG.UPDATE_TABLE);
            main.emit(EVENT_TAG.UPDATE_DECORATION);
        }
    }

    // 装修类型0吧台1-6对应1-6号桌7迎宾地垫8绿植9鲜花10招财摆件11灶王爷12生肖摆件
    private setSpite(type: number, idx: number = 1) {
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
        Utils.loadLocalSprite(path + idx, spriteNode.getComponent(cc.Sprite));
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}