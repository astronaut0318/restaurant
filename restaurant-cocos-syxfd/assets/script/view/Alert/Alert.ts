import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

export interface AlertData {
    title: string,
    content: string,
    cb?: () => void,
    that?: any
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Alert extends UIView {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    des: cc.Label = null;

    private _data: AlertData = null;

    init(data: AlertData) {
        this._data = data;
    }

    onOpen() {
        if (this._data.title) {
            this.title.string = this._data.title;
        }
        if (this._data.content) {
            this.des.string = this._data.content;
            if (this.des.fontSize * this._data.content.length > 500) {
                this.des.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            }
        }
    }

    onClickOk() {
        if (this._data.cb && this._data.that) {
            this._data.cb.bind(this._data.that)();
        }
        uiManager.close(this);
    }

}