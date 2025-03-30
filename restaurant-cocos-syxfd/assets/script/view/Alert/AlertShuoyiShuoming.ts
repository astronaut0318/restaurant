import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShuoyiShuoming extends UIView {

    onClickClose() {
        uiManager.close(this);
    }

}