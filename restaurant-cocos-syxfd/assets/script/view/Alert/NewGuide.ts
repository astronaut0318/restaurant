import { STORAGE_KEY } from "../../config/GameConfig";
import { UIID } from "../../config/UIConfig";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import GameStorage from "../../utils/GameStorage";
import Hall from "../Hall/Hall";

export interface AlertData {
    title: string,
    content: string,
    cb?: () => void,
    that?: any
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewGuide extends UIView {

    @property([cc.Node])
    nodes: cc.Node[] = [];

    private callback = null;

    onOpen(callback) {
        if (callback) {
            this.callback = callback;
        }
    }

    onClick0() {
        this.nodes[0].active = false;
        this.nodes[1].active = true;
    }

    onClick1() {
        this.nodes[1].active = false;
        this.nodes[2].active = true;
    }

    onClick2() {
        this.nodes[2].active = false;
        this.nodes[3].active = true;
    }

    onClick3() {
        this.nodes[3].active = false;
        this.nodes[4].active = true;
    }

    onClick4() {
        this.nodes[4].active = false;
        this.nodes[5].active = true;
    }

    onClick5() {
        this.nodes[5].active = false;
        this.nodes[6].active = true;
    }

    onClick6() {
        this.nodes[6].active = false;
        _LOG("新手教程完成");
        uiManager.close(this);
        Hall.showStartNum();
    }

}