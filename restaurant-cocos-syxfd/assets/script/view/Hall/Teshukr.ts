import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Teshukr extends cc.Component {

    // onLoad () {}
    private yilingqi = false;

    start() {

    }

    onClick() {
        if (this.yilingqi) return;
        uiManager.showWindow(UIID.AlertTeshuKeren, {
            config: this.node["_config"],
            index: this.node["_index"],
            root: this,
        });
    }

    public setYilingqu() {
        this.yilingqi = true;
    }

    // update (dt) {}
}
