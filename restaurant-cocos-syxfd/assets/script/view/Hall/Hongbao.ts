import { EVENT_TAG } from "../../config/GameConfig";
import { main } from "../../Main";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hongbao extends cc.Component {

    start() {
        main.on(EVENT_TAG.AUTO_GET_HONGBAO, this.addHongbao, this);
    }

    addHongbao() {
        let hongbaoNum = this.node["hongbaoNum"];
        main.emit(EVENT_TAG.ADD_FLY_RED_PACK, hongbaoNum, cc.v2(this.node.x, this.node.y))
        this.node.destroy();
    }

    onDestroy() {
        main.off(EVENT_TAG.AUTO_GET_HONGBAO, this.addHongbao, this);
    }

    // update (dt) {}
}
