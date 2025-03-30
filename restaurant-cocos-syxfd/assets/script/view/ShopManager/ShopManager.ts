import { api } from "../../api/api";
import { EVENT_TAG, LOCAL_CONFIG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import CaipuItem from "./CaipuItem";
import ChuniangItem from "./ChuniangItem";
import RenovationItem from "./RenovationItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopManager extends UIView {
    @property(List)
    renovatioList: List = null;

    @property([cc.Node])
    btn1s: cc.Node[] = [];

    @property([cc.Node])
    btn2s: cc.Node[] = [];

    @property([cc.Node])
    layers: cc.Node[] = [];

    @property(List)
    caipuList: List = null;

    @property(cc.Node)
    yuangongGrid: cc.Node = null;

    // 装修类型0吧台1-6对应1-6号桌7迎宾地垫8绿植9鲜花10招财摆件11灶王爷12生肖摆件
    private renovationData: any[][] = [];

    private caipuData: any[][] = null;

    private chuniangData: any[][] = null;

    onOpen() {
        this.getRenovation();

        main.on(EVENT_TAG.UPDATE_SHOP_MANAGER_R, this.getRenovation, this);
        main.on(EVENT_TAG.UPDATE_SHOP_MANAGER_C, this.getCaipu, this);
        main.on(EVENT_TAG.UPDATE_SHOP_MANAGER_C_N, this.getChuniang, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.UPDATE_SHOP_MANAGER_R, this.getRenovation, this);
        main.off(EVENT_TAG.UPDATE_SHOP_MANAGER_C, this.getCaipu, this);
        main.off(EVENT_TAG.UPDATE_SHOP_MANAGER_C_N, this.getChuniang, this);
    }

    private getRenovation() {
        this.renovationData = [];
        this.layers[0].active = true;
        let Table = Global.localConfig[LOCAL_CONFIG.Table] || [];
        let Decoration = Global.localConfig[LOCAL_CONFIG.DecorationUpgradeConfig] || [];

        for (let i = 0; i < Table.length; i += 10) {
            this.renovationData.push(Table.slice(i, i + 10));
        }
        for (let i = 0; i < Decoration.length; i += 10) {
            this.renovationData.push(Decoration.slice(i, i + 10));
        }

        _LOG("装饰列表数据", this.renovationData);
        this.renovatioList.numItems = this.renovationData.length;
    }

    private getCaipu() {
        this.caipuData = [];
        this.layers[1].active = true;

        this.caipuData = Utils.formatFoods();
        _LOG("解锁菜谱数据", this.caipuData);

        this.caipuList.numItems = this.caipuData.length;
    }

    private getChuniang() {
        this.layers[2].active = true;

        this.chuniangData = Utils.formatCookWoman();
        _LOG("解锁厨娘数据", this.chuniangData);

        this.yuangongGrid.children.forEach((node, i) => {
            let script = node.getComponent(ChuniangItem);
            script.setData(this.chuniangData[i], i);
        })
    }

    onRenovationItemRender(item: cc.Node, idx: number) {
        let script = item.getComponent(RenovationItem);
        script.setData(this.renovationData[idx], idx);
    }

    onCaiputemRender(item: cc.Node, idx: number) {
        let script = item.getComponent(CaipuItem);
        script.setData(this.caipuData[idx], idx);
    }

    public onClickChange(event, customEventData) {
        let node: cc.Node = event.target;
        this.btn2s.forEach(btn => {
            if (btn === node) {
                btn.active = false;
            } else {
                btn.active = true;
            }
        })

        this.btn1s.forEach((btn, index) => {
            if (index == customEventData) {
                btn.active = true;
            } else {
                btn.active = false;
            }
        })

        this.layers.forEach((e, i) => {
            if (i == customEventData) {
                e.active = true;
            } else {
                e.active = false;
            }
        })

        switch (customEventData) {
            case "0":
                this.getRenovation();
                break;
            case "1":
                this.getCaipu();
                break;
            case "2":
                this.getChuniang();
                break;
        }
    }

    onClickClose() {
        Utils.closeEvent(this);
        main.emit(EVENT_TAG.UPDATE_TABLE);
        main.emit(EVENT_TAG.UPDATE_DECORATION);
        main.emit(EVENT_TAG.UPDATE_UN_LOCK_COOK_WOMAN);
    }
}