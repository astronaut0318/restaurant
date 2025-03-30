import { timeStamp } from "console";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import ShareHisBtn from "./ShareHisBtn";
import ShareHisItem from "./ShareHisItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareHis extends UIView {
    @property([cc.Node])
    btnNodes: cc.Node[] = [];

    @property(List)
    list: List = null;

    private isDaijihuo = false;
    private _data = null;
    private listData = null;
    init(data) {
        this._data = data;
    }

    onOpen() {
        this.listData = this._data[0];
        if (this.listData) {
            this.list.numItems = this.listData.length;
        }
    }

    private resetBtnBar() {
        this.btnNodes.forEach(node => {
            this.setBarByNode(node, false);
        })
    }

    private setBarByNode(node: cc.Node, show: boolean) {
        let s: ShareHisBtn = node.getComponent(ShareHisBtn);
        if (s) {
            s.setBar(show);
        }
    }

    onItemRender(item: cc.Node, idx: number) {
        let script: ShareHisItem = item.getComponent(ShareHisItem);
        if (script) {
            script.setData(this.listData[idx], this.isDaijihuo);
        }
    }

    onClickZhiyao() {
        this.resetBtnBar();
        this.setBarByNode(this.btnNodes[0], true);
        this.listData = this._data[0];
        if (this.listData) {
            this.isDaijihuo = false;
            this.list.numItems = this.listData.length;
        }
    }


    onClickKuosan() {
        this.resetBtnBar();
        this.setBarByNode(this.btnNodes[1], true);
        this.listData = this._data[1];
        if (this.listData) {
            this.isDaijihuo = false;
            this.list.numItems = this.listData.length;
        }
    }

    onClickDaijihuo() {
        this.resetBtnBar();
        this.setBarByNode(this.btnNodes[2], true);
        this.listData = this._data[2];
        if (this.listData) {
            this.isDaijihuo = true;
            this.list.numItems = this.listData.length;
        }
    }

    onClickClose() {
        uiManager.close(this);
    }

}