import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertAgeLimit extends UIView {

    onClickOk() {
        uiManager.close(this);
    }

}