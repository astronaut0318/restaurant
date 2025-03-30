import { api } from "../../api/api";
import Audioplayer from "../../audio/Audioplayer";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import TaskManager from "../Hall/TaskManager";
import ChengjIuItem from "./ChengjIuItem";
import EveryDayTaskItem from "./EveryDayTaskItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EveryDayTask extends UIView {
    @property(List)
    taskList: List = null;

    @property(List)
    chengjiuList: List = null;

    @property(cc.Node)
    taskNode: cc.Node = null;

    @property(cc.Node)
    chengjiuNode: cc.Node = null;

    private taskData: any[] = null;
    private chengjiuData: any[] = null;

    onOpen() {
        this.getTask()

        main.on(EVENT_TAG.UPDATE_EVERY_TASK, this.onClickTask, this);
        main.on(EVENT_TAG.UPDATE_CHENGJIU, this.onClickChengjiu, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.UPDATE_EVERY_TASK, this.onClickTask, this);
        main.off(EVENT_TAG.UPDATE_CHENGJIU, this.onClickChengjiu, this);
    }

    onClickTask() {
        this.taskNode.active = true;
        this.chengjiuNode.active = false;
        this.getTask();
    }

    onClickChengjiu() {
        this.taskNode.active = false;
        this.chengjiuNode.active = true;
        this.getChengjiu();
    }

    private getTask() {
        this.taskData = TaskManager.inst.getEveryDayTask();
        if (this.taskData) {
            this.taskList.numItems = this.taskData.length;
        }
    }

    private getChengjiu() {
        this.chengjiuData = TaskManager.inst.getAchievement();
        if (this.chengjiuData && this.chengjiuList) {
            this.chengjiuList.numItems = this.chengjiuData.length;
        }
    }

    onTaskListRender(item: cc.Node, idx: number) {
        let script = item.getComponent(EveryDayTaskItem);
        script.setData(this.taskData[idx]);
    }

    onChengjiuListRender(item: cc.Node, idx: number) {
        let script = item.getComponent(ChengjIuItem);
        script.setData(this.chengjiuData[idx]);
    }

    onClickClose() {
        Utils.closeEvent(this);
    }
}