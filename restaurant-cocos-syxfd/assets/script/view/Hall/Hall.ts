import Ad from "../../ad/Ad";
import { api } from "../../api/api";
import Audioplayer from "../../audio/Audioplayer";
import { remote_assets, REMOTE_ASSETS_NAME, assetsData, REMOTE_ASSET_TYPE, RESULT_CODE, DEBUG, EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY, All_DAY_TEMP } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { resLoader } from "../../libs/res/ResLoader";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import GameStorage from "../../utils/GameStorage";
import GL from "../../utils/GLRandom";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import ClockMakingMoney from "../Task/ClockMakingMoney";
import CountManager from "./CountManager";
import ShareLayer from "./ShareLayer";
import TaskGuideManager from "./TaskGuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Hall extends UIView {
    @property(cc.Node)
    dakaNode: cc.Node = null;

    @property(cc.Node)
    shareNode: cc.Node = null;

    public static _this;
    init() {
        Utils.hideLoading()
        Hall._this = this;
    }

    onLoad() {
        let rotate_tip = main.getChildByName("rotate_tip")
        if (rotate_tip?.active) {
            rotate_tip.active = false
            rotate_tip.active = true
            rotate_tip.zIndex = 9
        }
    }

    onOpen() {
        Audioplayer.play_music("bgm");
        // this.updateAsset()

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "CheckPermission", "()V");
        }

        let startNum = GameStorage.getInt(STORAGE_KEY.SHOP_START_DAY_NUMBER, 0);
        if (!startNum) {
            setTimeout(() => {
                uiManager.open(UIID.NewGuide);
            }, 10)
        } else {
            Hall.showStartNum();
        }

    }

    public static showStartNum() {
        //开张天数
        // let showStart = GameStorage.getBool(STORAGE_KEY.SHOW_SHOP_START, false);
        let all = GameStorage.getJson(STORAGE_KEY.SHOW_SHOP_START, {});
        let showStart = all[All_DAY_TEMP.show_shop_start] || false;

        if (!showStart) {
            let startNum = GameStorage.getInt(STORAGE_KEY.SHOP_START_DAY_NUMBER, 0);
            startNum += 1;
            GameStorage.setInt(STORAGE_KEY.SHOP_START_DAY_NUMBER, startNum);

            setTimeout(() => {
                uiManager.open(UIID.AlertShopStart);
            }, 10)

            // GameStorage.setBool(STORAGE_KEY.SHOW_SHOP_START, true);
            // let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
            all[All_DAY_TEMP.show_shop_start] = true;
            GameStorage.setJson(STORAGE_KEY.SHOW_SHOP_START, all);
        } else {
            Hall.initOffline();
        }
    }

    public static initOffline() {
        //一天中离线收益获取最大次数
        let offlineMaxCount = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.off_line_get_count);

        // let offlineCount = GameStorage.getInt(STORAGE_KEY.OFFLINE_COUNT, 0);
        let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
        let offlineCount = all[All_DAY_TEMP.offline_count] || 0;

        let startTime = GameStorage.getString(STORAGE_KEY.GAME_TIME);
        if (!startTime) {
            GameStorage.setString(STORAGE_KEY.GAME_TIME, Utils.nowStr());
            return
        };
        let diff = Utils.getDateDiff(new Date(startTime).getTime(), Date.now());
        _LOG("离线时间：", diff);
        if (offlineCount < offlineMaxCount && diff.minutes > 0) {
            let offlineConfig = Utils.getOfflineConfig();
            console.log(offlineConfig)
            if (!offlineConfig) return;
            let gl = new GL({
                min: 1,
                max: 11,
                fenpei: new Map([
                    [1, 0.3],
                    [2, 0.7],
                ])
            });
            let r = gl.random() - 1;

            if (diff.hours > 8) {
                diff.hours = 8;
            }
            let money = offlineConfig["awardMoneyMax"];//[r]
            let money2 = money / 60;
            let num = diff.hours * money + diff.minutes * money2;
            num = parseInt(num.toFixed(0));


            setTimeout(() => {
                uiManager.showWindow(UIID.AlertGetIncome, {
                    cb: null,
                    thisObj: this,
                    title: "欢迎回来",
                    des: `你一共离线${diff.str}`,
                    isOffline: true,
                    num
                })
            }, 0)
        }

        //存入当前时间戳
        // GameStorage.setInt(STORAGE_KEY.GAME_TIME, Date.now());
        cc.director.getScheduler().schedule(() => {
            GameStorage.setString(STORAGE_KEY.GAME_TIME, Utils.nowStr());
        }, Hall._this, 10)
    }

    onClickUserInfo() {
        uiManager.open(UIID.UserInfo);
    }

    onClickTixian() {
        uiManager.open(UIID.AlertWallet);
    }

    onClickShopUp() {
        // return;
        uiManager.showWindow(UIID.AlertShopUpLvlRedPack);
    }

    onClickHelp() {
        uiManager.showWindow(UIID.Help);
    }

    onClickGuide() {
        uiManager.showWindow(UIID.AlertGuide);
    }

    onClickShare() {
        let script: ShareLayer = this.shareNode.getComponent(ShareLayer);
        if (script) {
            script.open();
        }
    }

    onClickEveryDayDaKa() {
        let script: ClockMakingMoney = this.dakaNode.getComponent(ClockMakingMoney);
        if (script) {
            script.open();
        }
    }

    onClickEveryDayTask() {
        uiManager.showWindow(UIID.EveryDayTask);
    }

    onClickChiHuoJie() {
        if (Global.chihuojieOpen) {
            uiManager.open(UIID.Toast, {
                title: "吃货节已经开启"
            })
            return;
        }
        uiManager.showWindow(UIID.AlertChiHuoJie);
    }

    onClickFandianguanli() {
        uiManager.showWindow(UIID.ShopManager);
    }

    onClickAutoFuwu() {
        let time = GameStorage.getInt(STORAGE_KEY.AUTO_FUWU_TIME, 0);
        if (time <= 0) {
            Global.autoFuwuOpen = false;
        }

        if (Global.autoFuwuOpen) {
            uiManager.open(UIID.Toast, {
                title: "自动服务已开启"
            })
            return;
        }
        uiManager.showWindow(UIID.AlertAutoFuWu);
    }

    //一键揽客
    onClickQuickGetKeren(evt) {
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
        })
    }

    private updateAsset() {
        _LOG("remote_assets", remote_assets)

        let sprite_assets = [
            // { name: REMOTE_ASSETS_NAME.HALL_BG, sprite: this.hall_bg }
        ]

        for (let i = 0; i < sprite_assets.length; i++) {
            let sprite_assets_item = sprite_assets[i];

            let assetData: assetsData = Utils.getLocalAssetData(sprite_assets_item.name)
            if (assetData) {
                let spriteFrame = new cc.SpriteFrame();
                spriteFrame.setTexture(assetData.pngAsset);
                if (sprite_assets_item.sprite instanceof Array) {
                    sprite_assets_item.sprite.forEach(sprite => {
                        sprite.spriteFrame = spriteFrame
                    })
                } else {
                    sprite_assets_item.sprite.spriteFrame = spriteFrame
                }
            }
        }
    }

    onDestroy() {

    }

}