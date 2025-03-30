import Ad from "../../ad/Ad";
import { All_DAY_TEMP, EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertGetIncome extends UIView {
    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Label)
    incomeLabel: cc.Label = null;

    @property(cc.Node)
    btn: cc.Node = null;

    @property(cc.Node)
    lixianLayer: cc.Node = null;

    @property(cc.Label)
    lixianTitle: cc.Label = null

    @property(cc.Label)
    lixianNum: cc.Label = null

    private _data = null;

    private storageIncome = 0;

    init(data) {
        this._data = data;
    }

    //吧台和离线使用
    onOpen() {
        if (this._data.title) {
            this.titleLabel.string = this._data.title;
        }
        if (this._data.isOffline) {
            this.incomeLabel.string = "+" + this._data.num;
            this.btn.active = false;
            this.lixianLayer.active = true;
            let offlineMaxCount = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.off_line_get_count);
            // let offlineCount = GameStorage.getInt(STORAGE_KEY.OFFLINE_COUNT, 0);
            let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
            let offlineCount = all[All_DAY_TEMP.offline_count] || 0;

            this.lixianNum.string = (offlineMaxCount - offlineCount) + "";
            this.lixianTitle.string = this._data.des;
        } else {
            this.storageIncome = GameStorage.getInt(STORAGE_KEY.SHOP_INCOME) || 0;
            this.incomeLabel.string = "+" + this.storageIncome;
        }
    }

    private addOfflineCount() {
        GameStorage.setString(STORAGE_KEY.GAME_TIME, Utils.nowStr());
        // let offlineCount = GameStorage.getInt(STORAGE_KEY.OFFLINE_COUNT, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        let offlineCount = all[All_DAY_TEMP.offline_count] || 0;
        offlineCount += 1;
        // GameStorage.setInt(STORAGE_KEY.OFFLINE_COUNT, offlineCount);
        all[All_DAY_TEMP.offline_count] = offlineCount;
        GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);
    }

    onClickGet() {
        if (!this._data.isOffline) {
            CountManager.inst.setEveryDayGetIncome(this.storageIncome);
            this._data.cb.bind(this._data.thisObj)();
            uiManager.close(this);
        } else {
            this._data.cb.bind(this._data.thisObj)();
            uiManager.close(this);
        }
    }

    // TODO SDK 看视频
    onClickGet2(evt) {
        CCUtils._this.delayButton(evt);
        Ad.playVideoAd(() => {
            if (!this._data.isOffline) {
                CountManager.inst.setEveryDayGetIncome(this.storageIncome * 2);
                this._data.cb.bind(this._data.thisObj, true)();
                uiManager.close(this);
            } else {
                this.addOfflineCount();
                main.emit(EVENT_TAG.ADD_FLY_MONEY, this._data.num * 2);
                uiManager.close(this);
            }
        })
    }

    onClickClose() {
        if (this._data.isOffline) {
            this.addOfflineCount();
            main.emit(EVENT_TAG.ADD_FLY_MONEY, this._data.num);
            Utils.closeEvent(this);
        } else {
            Utils.closeEvent(this);
        }
    }

}