import Audioplayer from "../../audio/Audioplayer";
import { STORAGE_KEY } from "../../config/GameConfig";
import GameStorage from "../../utils/GameStorage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnBGM extends cc.Component {

    @property(cc.Node)
    noMute: cc.Node = null;

    @property(cc.Node)
    mute: cc.Node = null;

    private Anim: cc.Animation = null;

    start() {
        this.Anim = this.node.getComponent(cc.Animation);
        this.upMuteIcon();
    }

    onClickBackGroundMusic() {
        let music_mute = GameStorage.getBool(STORAGE_KEY.MUSIC_MUTE, false);
        music_mute = !music_mute;
        GameStorage.setBool(STORAGE_KEY.MUSIC_MUTE, music_mute);
        Audioplayer.set_music_mute(music_mute);
        Audioplayer.set_sound_mute(music_mute);
        this.upMuteIcon();
    }

    private upMuteIcon() {
        let music_mute = GameStorage.getBool(STORAGE_KEY.MUSIC_MUTE, false);
        if (music_mute) {
            this.mute.active = true;
            this.noMute.active = false;
            this.Anim.stop();
        } else {
            this.mute.active = false;
            this.noMute.active = true;
            this.Anim.play();
        }
    }

    // update (dt) {}
}
