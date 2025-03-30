import Audioplayer from "../../audio/Audioplayer";
import { uiManager } from "../../ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnClose extends cc.Component {

    onClickClose() {
        this.node.getComponent(cc.Button).enabled = false;
        this.scheduleOnce(() => {
            this.node.getComponent(cc.Button).enabled = true;
        }, 1)
        Audioplayer.play_sound("btn_click");
        uiManager.close();
    }
}
