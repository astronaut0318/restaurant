import { STORAGE_KEY } from "../../config/GameConfig";
import List from "../../ui/list/List";
import GameStorage from "../../utils/GameStorage";
import RItemItem from "./RItemItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RenovationItem extends cc.Component {
    @property(List)
    list: List = null;

    @property(cc.Node)
    red: cc.Node = null;

    @property(cc.Node)
    green: cc.Node = null;

    @property(cc.Label)
    title: cc.Label = null;

    // onLoad () {}
    private listData: any[] = null;

    start() {
        // this.list.numItems = 10;
    }

    onItemRender(item: cc.Node, idx: number) {
        let script = item.getComponent(RItemItem);
        script.setData(this.listData[idx], idx);
    }

    // 装修类型0吧台1-6对应1-6号桌7迎宾地垫8绿植9鲜花10招财摆件11灶王爷12生肖摆件
    public setData(data, idx: number) {
        if (idx % 2 == 0) {
            this.red.active = true;
        } else {
            this.green.active = true;
        }

        let titleStr = "";
        if (idx == 0) {
            titleStr = "吧台";
        } else if (idx > 0 && idx < 7) {
            titleStr = idx + "号桌";
        } else if (idx == 7) {
            titleStr = "迎宾地垫";
        } else if (idx == 8) {
            titleStr = "绿植";
        } else if (idx == 9) {
            titleStr = "鲜花";
        } else if (idx == 10) {
            titleStr = "招财摆件";
        } else if (idx == 11) {
            titleStr = "灶王爷";
        } else if (idx == 12) {
            titleStr = "生肖摆件";
        }
        this.title.string = titleStr;

        this.listData = data;
        let addShowBuy = false;
        if (this.listData) {
            for (let i = 0; i < this.listData.length; i++) {
                const element = this.listData[i];
                let unlock = false;
                let isUse = false;
                let needMoney = 0;
                if (idx < 7) {
                    let unlockTables: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES, []);
                    if (unlockTables.includes(element.id)) {
                        unlock = true;
                    }
                    let useTable: number[] = GameStorage.getJson(STORAGE_KEY.USE_TABLE, []);
                    if (useTable.includes(element.id)) {
                        isUse = true;
                    }
                    needMoney = element.upgrade;
                } else {
                    let unDecoration: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []);
                    if (unDecoration.includes(element.id)) {
                        unlock = true;
                    }
                    let useDecoration: number[] = GameStorage.getJson(STORAGE_KEY.USE_DECORATION, []);
                    if (useDecoration.includes(element.id)) {
                        isUse = true;
                    }
                    needMoney = element.needMoney;
                }

                if (!unlock && !addShowBuy) {
                    addShowBuy = true;
                    element["showBuy"] = true;
                }
                element["type"] = idx;
                element["unlock"] = unlock;
                element["isUse"] = isUse;
                element["needMoney"] = needMoney;
            }
            this.list.numItems = this.listData.length;
        }
    }

    // update (dt) {}
}
