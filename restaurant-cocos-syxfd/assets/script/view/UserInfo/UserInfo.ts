import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import WxUtil from "../../wx/Wx";
import { AlertDoubleData } from "../Alert/AlertDouble";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserInfo extends UIView {
    @property(cc.Label)
    userName: cc.Label = null;

    @property(cc.Label)
    shareID: cc.Label = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    init(data) {
    }

    onOpen() {
        this.userName.string = Global.username;
        this.shareID.string = Global.shareID;
        Utils.loadRemoteImg(Global.headUrl, this.head);
    }

    onClickClose() {
        uiManager.close(this);
    }

    onClickShareToWX() {
        _LOG("微信分享");
        WxUtil.shareWeb();
    }

    onClickUserService() {
        uiManager.open(UIID.UserWebView, {
            url: Global.about,
            title: "客服"
        });
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
    onClickClear() {
        uiManager.clearCache();
        uiManager.open(UIID.Toast, {
            title: "清除成功"
        })
    }

    onClickQuit() {
        let data: AlertDoubleData = {
            title: "退出登录",
            content: "是否退出登录",
            cb: this.quit,
            that: this
        }
        uiManager.showWindow(UIID.AlertDouble, data);
    }

    onClickCopy() {
        Utils.copy(this.shareID.string);
    }

    quit() {
        GameStorage.clear();
        Global.accountCode = "";
        cc.sys.localStorage.setItem("LoginedAccountCode", Global.accountCode);
        uiManager.closeAll();
        cc.director.loadScene("Main");
        // uiManager.open(UIID.Login);
    }

}