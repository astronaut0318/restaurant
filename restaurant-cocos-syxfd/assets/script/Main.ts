import { UIConfig, UIID } from "./config/UIConfig";
import { uiManager } from "./ui/UIManager";
import { api } from "./api/api";
import Utils from "./utils/Utils";
import { assetsData as assetData, DEBUG, EVENT_TAG, LOCAL_CONFIG, STORAGE_KEY, } from "./config/GameConfig";
import Loading from "./view/Loading/Loading";
import GameStorage from "./utils/GameStorage";
import { Global } from "./config/Global";
import Http from "./utils/Http";
import Audioplayer from "./audio/Audioplayer";
import { HotUpdateCode, HotUpdateMgr } from "./hotupdate/HotUpdateMgr";
import CountManager from "./view/Hall/CountManager";
import Request2 from "./utils/Request";

const { ccclass, property } = cc._decorator;

export let main: cc.Node = null

@ccclass
class Main extends cc.Component {

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Node)
    public rotateTip: cc.Node = null;

    @property(HotUpdateMgr)
    public hotUpdateMgr: HotUpdateMgr = null;

    @property(cc.Node)
    public progressNode: cc.Node = null;

    private loadingScript: Loading = null;

    onLoad() {
        globalThis._LOG = (...data) => {
            if (DEBUG) {
                console.log(...data)
            }
        }

        if (CC_DEBUG) {
            //     window["vConsole"].$dom.style.display = "none";
            //     // cc.debug.setDisplayStats(false);
            // window["reGame"] = function () {
            //     GameStorage.clear();

            //     let data = {
            //         userid: Global.userid,
            //         data: JSON.stringify({}),
            //         level: 0
            //     }
            //     Http.request_post("setuserdata", data, res => {
            //         _LOG("重置远程用户数据", res);
            //     }, err => { })
            // }
            window["g"] = Global;
        }

        GameStorage.syncToServerEnable = true;
        main = this.node;
        this.loadingScript = this.loading.getComponent("Loading");
    }

    start() {
        _LOG("单机")

        uiManager.initUIConf(UIConfig);
        uiManager.preload(UIID.Login);
        uiManager.preload(UIID.Hall);

        Audioplayer.init()

        this.node.on(EVENT_TAG.ENTER_HALL, this.enterHall, this);

        if (!cc.sys.isNative) {
            this.gameStart();
            return;
        }

        this.hotUpdateMgr.init();
        this.progressNode.active = true;
        Global.version = this.hotUpdateMgr.getLocalVersion();
        this.gameStart();

        // this.hotUpdateMgr.checkUpdate((code) => {
        //     if (code == HotUpdateCode.NEED_TO_UPDATE) {
        //         this.progressNode.active = true;
        //     } else {
        //         Global.version = this.hotUpdateMgr.getLocalVersion();
        //         this.gameStart();
        //     }
        // })
    }

    gameStart() {
        if (Global.noServer) {
            this.enterHall();
        } else {
            uiManager.open(UIID.Login);
        }
    }

    enterHall() {
        CountManager.inst.checkMakingCount();
        this.loadingScript?.reset();
        // 加载配置
        let configKeys = Object.keys(LOCAL_CONFIG);
        let count = 0;
        let totalCount = configKeys.length * 50;

        Request2.getApp().open('game/config', {}, res => {
            _LOG("同步游戏配置文件：", res);
            let { code, data } = res;
            if (code == 0) {
                for (let i = 0; i < configKeys.length; i++) {
                    const key = configKeys[i];
                    Global.localConfig[LOCAL_CONFIG[key]] = data[LOCAL_CONFIG[key]];

                    count += 1;
                    _LOG("加载" + LOCAL_CONFIG[key] + "成功");
                    this.loadingScript?.setProgress(count, totalCount)
                    if (count >= configKeys.length) {
                        // this.getReomte(count, totalCount, configKeys.length);
                        // 更新进度条，进入场景
                        uiManager.open(UIID.Hall, this.node, (completedCount: number, totalCount: number, item: any) => {
                            this.loadingScript?.setProgress(completedCount, totalCount)
                        });
                    }
                }
            }
        })
    }

    update(dt) {
    }
}