import { main } from "../../Main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareCapture extends cc.Component {

    camera: cc.Camera = null;
    _canvas = null;
    texture: cc.RenderTexture = null;

    _width = 750;
    _height = 1334;

    start() {
        this.init();
        // create the capture
 
        this.scheduleOnce(() => {
            let picData = this.initImage();
            this.createCanvas(picData);
            this.saveFile(picData);
            this.camera.enabled = false;
        }, 1);
    }

    init() {
        if (!this._canvas) {
            this._canvas = cc.find('Canvas');
        }
        if (!this.camera) {
            this.camera = cc.Camera.findCamera(main);
            this.camera.enabled = true;
        }
        let texture = new cc.RenderTexture();
        texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, cc.gfx.RB_FMT_S8);
        this.camera.targetTexture = texture;
        this.texture = texture;
    }

    // override
    initImage() {
        let data = this.texture.readPixels();
        this._width = this.texture.width;
        this._height = this.texture.height;
        let picData = this.filpYImage(data, this._width, this._height);
        return picData;
    }

    // override init with Data
    createCanvas(picData) {
        let texture = new cc.Texture2D();
        texture.initWithData(picData, 32, this._width, this._height);

        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);

        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        node.zIndex = cc.macro.MAX_ZINDEX;
        node.parent = cc.director.getScene();
        // set position
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        node.x = width / 2;
        node.y = height / 2;
        node.on(cc.Node.EventType.TOUCH_START, () => {
            node.parent = null;
            node.destroy();
        });

        this.captureAction(node, width, height);
    }

    saveFile(picData) {
        if (CC_JSB) {
            let filePath = jsb.fileUtils.getWritablePath() + 'render_to_sprite_image.png';

            let success = jsb.saveImageData(picData, this._width, this._height, filePath)
            if (success) {
                console.log("save image data success, file: " + filePath);

                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "share", "(Ljava/lang/String;)V", filePath);
                this.node.destroy();

            }
            else {
                console.error("save image data failed!");
            }
        }
    }

    // This is a temporary solution
    filpYImage(data, width, height) {
        // create the data array
        let picData = new Uint8Array(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }

    // sprite action
    captureAction(capture, width, height) {
        let scaleAction = cc.scaleTo(1, 0.3);
        let targetPos = cc.v2(width - width / 6, height / 4);
        let moveAction = cc.moveTo(1, targetPos);
        let spawn = cc.spawn(scaleAction, moveAction);
        capture.runAction(spawn);
        let blinkAction = cc.blink(0.1, 1);
        // scene action
        this.node.runAction(blinkAction);
    }

    // update (dt) {}
}
