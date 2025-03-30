import { Global } from "../config/Global";
import Http from "../utils/Http";
import Request2 from "../utils/Request";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Ad extends cc.Component {

    static waitForCallback: boolean = false;
    /**
     * 播放激励视频广告
     * @param callback 激励视频获取奖励回调
     */
    static playVideoAd(callback) {
        console.log("播放激励视频广告")
        if (CC_DEBUG) {
            callback();
            return;
        }

        try {
            window['videoCallBack'] = () => {
                if (!this.waitForCallback) {
                    return;
                }
                this.waitForCallback = false;
                console.log("a---videoCallBack");
                let data = {
                    id: Global.userid,
                }
                Request2.getApp().open('user/ad/add', data, res => {});
                callback();
            }
            this.waitForCallback = true;
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "onCocosPlayVideoAd", "(Ljava/lang/String;)V", "window.videoCallBack");
        } catch (error) {

        }

    }
    /**
     * 展示横幅广告
     * 初次展示可能会有延时
     */
    static bannerShow() {
        try {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "bannerShow", "()V");
        } catch (error) {

        }
    }
    /**
     * 隐藏横幅广告
     */
    static bannerHide() {
        try {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "bannerHide", "()V");
        } catch (error) {

        }
    }
    /**
     * 展示插屏广告
     */
    static interactionView() {
        try {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "interactionView", "()V");
        } catch (error) {

        }
    }
}
