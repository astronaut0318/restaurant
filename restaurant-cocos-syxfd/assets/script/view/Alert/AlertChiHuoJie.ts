import Ad from "../../ad/Ad";
import { EVENT_TAG } from "../../config/GameConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";
import TaskGuideManager from "../Hall/TaskGuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertChiHuoJie extends UIView {

    // TODO 吃货节 SDK  看视频
    onClickOpen(evt) {
        CCUtils._this.delayButton(evt);
        Ad.playVideoAd(() => {
            main.emit(EVENT_TAG.OPEN_CHIHUOJIE);
            CountManager.inst.setDoubleIncomeCount();
            uiManager.close(this);
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }
}