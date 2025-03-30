import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends UIView {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Animation)
    anim: cc.Animation = null;

    private _data = null

    init(data) {
        this._data = data;
    }

    onOpen() {
        this.title.string = this._data.title;
        this.anim.on("stop", this.onStop, this);
    }

    onStop() {
        _LOG("toast stop");
        if (this._data.cb) {
            this._data.cb.bind(this._data.thisObj);
        }
        this.anim.off("stop", this.onStop, this);
        uiManager.close(this);
    }
}