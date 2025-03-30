import { EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Diancai extends cc.Component {

    // onLoad () {}

    start() {
        main.on(EVENT_TAG.DIAN_CAI, this.diancai, this);
    }

    diancai() {
        if (this.node.active) {
            this.node.active = false;
            main.emit(EVENT_TAG.SET_CHAOCAI_TASK, this.node["waitKeren"]);
            Utils.playSpine(this.node["waitKeren"].role, "wanshouji");
        }
    }

    onDestroy() {
        main.off(EVENT_TAG.DIAN_CAI, this.diancai, this);
    }

    // update (dt) {}
}
