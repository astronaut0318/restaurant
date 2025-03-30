import Ad from "../../ad/Ad";
import { All_DAY_TEMP, EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";
import TaskGuideManager from "../Hall/TaskGuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertAutoFuWu extends UIView {
    @property(cc.Label)
    des: cc.Label = null;

    @property(cc.Label)
    num: cc.Label = null;

    onOpen() {
        //服务时间
        let video_add_waiter_timer = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.video_add_waiter_timer);
        this.des.string = "+" + video_add_waiter_timer + "秒";

        //最大次数
        let waiter_max_video_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.waiter_max_video_count);

        // let autoFuwuCount = GameStorage.getInt(STORAGE_KEY.AUTO_FUWU_COUNT, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        let autoFuwuCount = all[All_DAY_TEMP.auto_service_count] || 0;

        this.num.string = (waiter_max_video_count - autoFuwuCount) + "";
    }

    // TODO SDK 看视频  自动服务
    onClickOpen(evt) {
        let waiter_max_video_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.waiter_max_video_count);
        // let autoFuwuCount = GameStorage.getInt(STORAGE_KEY.AUTO_FUWU_COUNT, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        let autoFuwuCount = all[All_DAY_TEMP.auto_service_count] || 0;

        if (autoFuwuCount >= waiter_max_video_count) return;

        CCUtils._this.delayButton(evt);
        Ad.playVideoAd(() => {
            
            autoFuwuCount += 1;

            // GameStorage.setInt(STORAGE_KEY.AUTO_FUWU_COUNT, autoFuwuCount);
            all[All_DAY_TEMP.auto_service_count] = autoFuwuCount;
            GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, all);

            this.num.string = (waiter_max_video_count - autoFuwuCount) + "";

            main.emit(EVENT_TAG.AUTO_FUWU);
            CountManager.inst.setAutoServiceCount();
            uiManager.close(this);
        })
    }

    onClickClose() {
        Utils.closeEvent(this);
    }
}