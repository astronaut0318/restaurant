import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import List from "../../ui/list/List";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import ShopLevelManager from "../Hall/ShopLevelManager";
import ShopUpItem from "./ShopUpItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShopUpLvlRedPack extends UIView {

    @property(List)
    list: List = null;

    private listData: any[] = [];

    onOpen() {
        this.getShopListData()
        main.on(EVENT_TAG.UPDATE_SHOPUP_LIST, this.getShopListData, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.UPDATE_SHOPUP_LIST, this.getShopListData, this);
    }

    private getShopListData() {
        this.listData = ShopLevelManager.inst.findShopLevelReward();
        if (this.listData) {
            _LOG("this.listData", this.listData);
            this.list.numItems = this.listData.length;
        }
    }

    onItemRender(item: cc.Node, idx: number) {
        let script = item.getComponent(ShopUpItem);
        script.setData(this.listData[idx], idx);
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}