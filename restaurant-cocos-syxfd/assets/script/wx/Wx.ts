import { Global } from "../config/Global";
import { UIID } from "../config/UIConfig";
import { uiManager } from "../ui/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WxUtil extends cc.Component {

    public static login(callback) {
        // if(callback) {
        //     callback("father");
        //     return;
        // }
        console.log('微信登录login');
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "WeChatLogin", "()V");
        if (callback) {
            window['WeChatLoginCb'] = function (code) {
                console.log('微信登录回调code:' + code);
                WxUtil.setOpenId(code);
                callback(code);
            }
        }
    }

    public static setOpenId(openid) {
        console.log('设置微信openid:' + openid);
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setOpenId", "(Ljava/lang/String;)V", openid);
    }

    public static shareWeb(url = "") {
        uiManager.open(UIID.Screenshot);
        // // url = `https://share.jkfd.shtutian.com/?os=ios&env=production&userId=1971271457&pkgId=285`;
        // url = `https://share.519151.com/?os=${cc.sys.os}&env=production&userId=${Global.shareID}&pkgId=285`;
        // console.log("分享链接" + url);
        // if (cc.sys.os === cc.sys.OS_ANDROID) {
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "shareWeb", "(Ljava/lang/String;)V", url);
        // }
    }

}
