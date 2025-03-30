import { EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertClearTable extends UIView {
    @property(cc.Sprite)
    table: cc.Sprite = null;

    private _data = null;

    init(data) {
        this._data = data;
    }

    onOpen() {
        let sprite: cc.Sprite = this._data["tableSprite"];
        this.table.spriteFrame = sprite.spriteFrame;
    }

    onClickClear() {
        uiManager.close(this);
        main.emit(EVENT_TAG.CLEAR_TABLE, this._data["tableIndex"]);
    }

    onClickClose() {
        Utils.closeEvent(this);
    }
}