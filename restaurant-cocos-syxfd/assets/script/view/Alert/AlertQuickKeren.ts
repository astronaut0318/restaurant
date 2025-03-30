import Ad from "../../ad/Ad";
import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";
import TaskGuideManager from "../Hall/TaskGuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertQuickKeren extends UIView {

    onOpen() {
    }

    onDestroy() {
    }

    onClickGet(evt) {
        if (!Global.canQuickGet) {
            uiManager.open(UIID.Toast, {
                title: "刚使用过一键揽客，过会再来"
            })
            return;
        };
        CCUtils._this.delayButton(evt);
        Ad.playVideoAd(() => {
            // TODO SDK 看视频 一键揽客
            main.emit(EVENT_TAG.QUICK_GET_KEREN);
            CountManager.inst.setQuikCustomerCount();
            uiManager.close(this);
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}