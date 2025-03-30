const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.Label)
    loadingLabel: cc.Label = null

    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null

    @property(cc.Node)
    barNode: cc.Node = null

    start() {

    }

    public reset() {
        this.bar.progress = 0;
    }

    public setProgress(completedCount: number, totalCount: number) {
        if (!this.barNode.active) {
            this.barNode.active = true;
        }
        let current = completedCount / totalCount;
        if (current < 0.1 && current !== 0) current = 0.1;
        if (current > this.bar.progress) {
            this.loadingLabel.string = `${Math.round(current * 100)}%`
            this.bar.progress = current
        }
    }
}