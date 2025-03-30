import { EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RMB extends cc.Component {

    // onLoad () {}

    start() {
        main.on(EVENT_TAG.AUTO_GET_RMB, this.addChaopiao, this);
    }

    addChaopiao() {
        let rmbNum = this.node["rmbNum"];
        main.emit(EVENT_TAG.ADD_FLY_MONEY, rmbNum, cc.v2(this.node.x, this.node.y));
        this.node.destroy();
    }

    onDestroy() {
        main.off(EVENT_TAG.AUTO_GET_RMB, this.addChaopiao, this);
    }

    // update (dt) {}
}
