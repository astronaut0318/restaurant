import { api } from "../../api/api";
import { All_DAY_TEMP, DEBUG, EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import CCUtils from "../../utils/CCUtils";
import GameStorage from "../../utils/GameStorage";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";
import WxUtil from "../../wx/Wx";
import CountManager from "../Hall/CountManager";
import { Base64 } from "js-base64";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends UIView {

    @property(cc.Label)
    versionText: cc.Label = null;

    @property(cc.Button)
    loginBtn: cc.Button = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(cc.ToggleContainer)
    testAccounts: cc.ToggleContainer = null;

    onOpen() {
        if (Global.version) {
            this.versionText.string = Global.version;
        }

        const loginedAccountCode = cc.sys.localStorage.getItem("LoginedAccountCode");
        if (loginedAccountCode != null) {
            Global.accountCode = loginedAccountCode;
        }

        if(Global.accountCode == "") {
            uiManager.open(UIID.AlertAgeLimit);
        }
        

        let s0 = this.selectNode.getChildByName("0");
        let s1 = this.selectNode.getChildByName("1");
        this.selectNode.on(cc.Node.EventType.TOUCH_END, () => {
            s0.active = !s0.active;
            s1.active = !s1.active;
        }, this)

        if (Global.selectXioeyi || Global.accountCode != "") {
            s1.active = true;
        }

        if(Global.accountCode == "") {
            let show_agreement = GameStorage.getBool("show_agreement", true);
            if (show_agreement) {
                uiManager.open(UIID.AlertXieyi, s1);
                cc.sys.localStorage.setItem("show_agreement", "0");
            } else {
                if (cc.sys.os === cc.sys.OS_ANDROID) {
                    //jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "CheckPermission", "()V");
                }
            }
        }

        // uiManager.open(UIID.NewGuide);
        // uiManager.open(UIID.Screenshot);
        // let a = Utils.getNumberOfDays(Utils.getFormatDate(), Utils.getFormatDate())
        // console.log(a)

        window["abc"] = function (num) {
            CountManager.inst.setServiceCount(num);
        }

        this.schedule(() => {
            let localId = GameStorage.getInt("useridd_tempdata");
            if (localId > 0) {
                Global.userid = localId || 0;
                Global.shareID = Global.userid + 1000000 + "";
                this.getUserData();
                CountManager.inst.setLoginDayCount();
            }
        }, .2)

        if(Global.accountCode != "") {
            this.onClick(null);
        }
    }

    onClickUserAgreement() {
        uiManager.open(UIID.UserWebView, {
            url: Global.agreement,
            title: "用户协议"
        });
    }

    onClickUserPrivacy() {
        uiManager.open(UIID.UserWebView, {
            url: Global.policy,
            title: "隐私协议"
        });
    }

    onClick(evt) {

        if(Global.accountCode == "") {
            let s1 = this.selectNode.getChildByName("1");
            if ((!s1.active && !Global.selectXioeyi) && !CC_DEBUG) {
                Utils.showToast("请勾选用户协议");
                return;
            }
        }

        CCUtils._this.delayButton(evt);

        //if (cc.sys.isBrowser || cc.sys.isMobile || cc.sys.isNative) {
        if (cc.sys.isBrowser) {
            let accountCode =  Global.accountCode == "" ? 'father' : Global.accountCode;
            let query = { code: accountCode };
            Request2.getApp().open('user/login', query, (res) => {
               uiManager.close(this);
               cc.sys.localStorage.setItem("token", res.token);
               Global.userid = res.id || 0;
               //Global.userid = Number(Utils.getUrlParam(window.location.href, "uid")) || 4;
               Global.shareID = Global.userid + 1000000 + "";
               console.log(`login result: res.id=${res.id}, userid=${Global.userid}, shareid=${Global.shareID}`);
               this.getUserData();
               CountManager.inst.setLoginDayCount();
            });
            return;
        }
        else{
            WxUtil.login((code) => {
                if (code) {
                    console.log("发起登录请求：" + code);
                    // return;
    
                    let data = { code: code };
                    Request2.getApp().open('user/login', data, (res) => {
                        console.log("发起登录请求返回数据：" + JSON.stringify(res));
                        //uiManager.close(this);
                        cc.sys.localStorage.setItem("token", res.token);
                        Global.userid = res.id || 0;
                        Global.shareID = Global.userid + 1000000 + "";
                        Global.accountCode = code;
                        cc.sys.localStorage.setItem("LoginedAccountCode", code);
                        console.log(`login result: res.id=${res.id}, userid=${Global.userid}, shareid=${Global.shareID}`);
                        //this.getUserData();
                        //CountManager.inst.setLoginDayCount();
                        const real_auth = cc.sys.localStorage.getItem("real_auth");
                        if (real_auth == null && false) {
                            uiManager.open(UIID.AlertUserRealAuth, (status) => {
                                if(status > 0) {
                                    cc.sys.localStorage.setItem("real_auth", status.toString())
                                    uiManager.close(this);
                                    this.getUserData();
                                    CountManager.inst.setLoginDayCount(); 
                                }
                            });
                        }
                        else {
                            uiManager.close(this);
                            this.getUserData();
                            CountManager.inst.setLoginDayCount(); 
                        }
                    });
                }
            })

            return;
        }
    }

    getUserData() {
        //获取用户上传数据
        // let data = {
        //     id: Global.userid,
        // }

        Request2.getApp().open('user/chum/list', { id: Global.userid }, res => {
            console.log("获取列表getlistbyuserid", res);
            let { redirect, spread } = res.data;
            Global.friend = (redirect.length + spread.length);
            //Global.friend = redirect.length;
        });

        Request2.getApp().open('user/info', {}, res => {
            _LOG("getUserAllData:", res);
            console.log("发起登录请求返回数据getUserAllData：" + JSON.stringify(res));
            let { data } = res;
            // let jsonstring = data.jsonstring;
            if (data) {
                // let json = JSON.parse(jsonstring) || {};
                _LOG("解析的远程用户数据：", data);
                if (data.nickname) {
                    Global.username = data.nickname || "";
                }
                Global.headUrl = data.heading || "";

                //if(data.now_shop_level != null && data.now_shop_level != undefined) {
                //    let {id, lvl} = data.now_shop_level;
                //    Global.shopLevel = lvl;
                //    GameStorage.setJson(STORAGE_KEY.NOW_SHOP_LEVEL, { id, lvl });
                //}

                if(data.service_count != null && data.service_count != undefined) {
                    let serviceCount = data.service_count || 0;
                    GameStorage.setInt(STORAGE_KEY.SERVICE_COUNT, serviceCount);
                }

                if(data.now_task_guide != null && data.now_task_guide != undefined) {
                    GameStorage.setJson(STORAGE_KEY.NOW_TASK_GUIDE, data.now_task_guide);
                }

                if(data.use_table != null && data.use_table != undefined) {
                    Global.useTables = data.use_table;
                }

                if(data.table_service_count != null && data.table_service_count != undefined) {
                    GameStorage.setJson(STORAGE_KEY.FUWU_COUNT, data.table_service_count);
                }

                if(data.get_w_d_byLvl != null && data.get_w_d_byLvl != undefined) {
                    GameStorage.setJson(STORAGE_KEY.GET_W_D_BY_LVL, data.get_w_d_byLvl);
                }
                if(data.get_w_d_once != null && data.get_w_d_once != undefined) {
                    GameStorage.setJson(STORAGE_KEY.GET_W_D_ONCE, data.get_w_d_once);
                }
                if(data.get_w_d_share != null && data.get_w_d_share != undefined && Array.isArray(data.get_w_d_share)) {
                    GameStorage.setJson(STORAGE_KEY.GET_W_D_SHARE, data.get_w_d_share);
                }
                else {
                    let shareData: number[] = [];
                    GameStorage.setJson(STORAGE_KEY.GET_W_D_SHARE, shareData);
                }

                Global.leijishouyi = data.friends_all_income || 0;

                if(data.friends_today_incomes != null && data.friends_today_incomes != undefined) {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const todayStr = `${year}${month}${day}`;
                    if (todayStr in data.friends_today_incomes) {
                        const { all, redirect } = data.friends_today_incomes[todayStr];
                        Global.jinrizongshouyi = all || 0;
                        Global.zhiyaohaoyougoobgxian = redirect || 0;
                        Global.kuosanhaoyougongxian = all - redirect;
                    }
                }

                //let all = GameStorage.getJson(STORAGE_KEY.All_DAY_TEMP, {});
                if(data.all_day_temp != null && data.all_day_temp != undefined) {
                    // if (All_DAY_TEMP.every_day_task_geted in data.all_day_temp) {
                    //     all[All_DAY_TEMP.every_day_task_geted] = data.all_day_temp[All_DAY_TEMP.every_day_task_geted];
                    // }
                    // if (All_DAY_TEMP.every_day_task_quik in data.all_day_temp) {
                    //     all[All_DAY_TEMP.every_day_task_quik] = data.all_day_temp[All_DAY_TEMP.every_day_task_quik];
                    // }
                    // if (All_DAY_TEMP.every_day_get_income in data.all_day_temp) {
                    //     all[All_DAY_TEMP.every_day_get_income] = data.all_day_temp[All_DAY_TEMP.every_day_get_income];
                    // }
                    
                    // if (All_DAY_TEMP.auto_service_count in data.all_day_temp) {
                    //     all[All_DAY_TEMP.auto_service_count] = data.all_day_temp[All_DAY_TEMP.auto_service_count];
                    // }
                    // if (All_DAY_TEMP.offline_count in data.all_day_temp) {
                    //     all[All_DAY_TEMP.offline_count] = data.all_day_temp[All_DAY_TEMP.offline_count];
                    // }
                    GameStorage.setJson(STORAGE_KEY.All_DAY_TEMP, data.all_day_temp);
                }

                if(data.shop_start_day_number != null && data.shop_start_day_number != undefined) {
                    GameStorage.setInt(STORAGE_KEY.SHOP_START_DAY_NUMBER, data.shop_start_day_number);
                }

                if(data.show_shop_start != null && data.show_shop_start != undefined) {
                    GameStorage.setJson(STORAGE_KEY.SHOW_SHOP_START, data.show_shop_start);
                }

                if(data.every_day_tuhao != null && data.every_day_tuhao != undefined) {
                    GameStorage.setJson(STORAGE_KEY.EVERY_DAY_TUHAO, data.every_day_tuhao);
                }

                if(data.every_day_look_viedo != null && data.every_day_look_viedo != undefined) {
                    GameStorage.setJson(STORAGE_KEY.EVERY_DAY_LOOK_VIDEO, data.every_day_look_viedo);
                }

                if(data.every_day_service_count != null && data.every_day_service_count != undefined) {
                    GameStorage.setJson(STORAGE_KEY.EVERY_DAY_SERVICE_COUNT, data.every_day_service_count);
                }


                let keys = Object.keys(data);
                keys.forEach(key => {
                    let value = data[key];
                    _LOG("远程用户数据" + key + ':' + JSON.stringify(value) + ",," + typeof value)
                    switch (typeof value) {
                        case "number":
                        case "string":
                            if (value) {
                                cc.sys.localStorage.setItem(key, value);
                            }
                            break;
                        case "boolean":
                            if (value) {
                                cc.sys.localStorage.setItem(key, value ? "1" : "0");
                            }
                            break;
                        case "object":
                            if (value == null || value == "") {
                                break;
                            }
                            if (value) {
                                cc.sys.localStorage.setItem(key, JSON.stringify(value));
                            }
                            break;
                        default:
                            if (value) {
                                cc.sys.localStorage.setItem(key, value);
                            }
                            break;
                    }
                })
            }

            main.emit(EVENT_TAG.ENTER_HALL);
            uiManager.close(this);
        })
    }

    select() {
        // let s0 = this.selectNode.getChildByName("0");
        // let s1 = this.selectNode.getChildByName("1");
        // s0.active = !s0.active;
        // s1.active = !s1.active;
    }
}
