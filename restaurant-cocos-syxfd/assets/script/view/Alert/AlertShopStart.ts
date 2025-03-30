import { Util } from "pathfinding";
import { api } from "../../api/api";
import { EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import Hall from "../Hall/Hall";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertShopStart extends UIView {

    @property(cc.Label)
    day: cc.Label = null;

    @property(cc.Node)
    spineNode: cc.Node = null;

    onOpen() {
        Utils.playSpine(this.spineNode, "1", false, () => {
            let startNum = GameStorage.getInt(STORAGE_KEY.SHOP_START_DAY_NUMBER, 0);
            this.day.string = startNum + "";
            Utils.playSpine(this.spineNode, "2", false, () => {
                uiManager.close(this);
                Hall.initOffline();
            })
        })
    }

    onDestroy() {
    }

}