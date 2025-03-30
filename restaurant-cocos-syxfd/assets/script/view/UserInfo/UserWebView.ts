import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserWebView extends UIView {
    @property(cc.WebView)
    webView: cc.WebView = null;

    @property(cc.Label)
    title: cc.Label = null;

    private url: string = null
    private _title: string = null
    init(data) {
        if (data.url) {
            this.url = data.url;
        }

        if (data.title) {
            this._title = data.title;
        }
    }

    onOpen() {
        if (this.url) {
            this.webView.url = this.url;
        }
        if (this._title) {
            this.title.string = this._title;
        }
    }

    onDestroy() {
    }

    onClickClose() {
        uiManager.close(this);
    }

}