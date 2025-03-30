import { Global } from "../../config/Global";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Utils from "../../utils/Utils";
let CQRCode = require("./CQRCode");


const { ccclass, property } = cc._decorator;

@ccclass
export default class Screenshot extends UIView {

    @property(cc.Label)
    shareid: cc.Label = null;

    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Node)
    qrcodeNode: cc.Node = null;

    onOpen() {

        this.shareid.string = Global.shareID;
        this.username.string = Global.username;
        Utils.loadRemoteImg(Global.headUrl + "?aaa=aa.jpg", this.head);

        // let qrcode = new
        let qr = this.qrcodeNode.getComponent(CQRCode);
        qr.string = "https://www.pgyer.com/f7cyKgxP";
        //qr.string = `${Global.serverHost}/share?id=${Global.userid}`;

        this.scheduleOnce(() => {
            this.share_image()
        }, 0)
    }

    share_image() {
        // 新建一个 RenderTexture,如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        var texture = new cc.RenderTexture();
        texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, cc.gfx.RB_FMT_S8);

        // 创建一个camera, 并且设置 camera 的 targetTexture 为新建的 RenderTexture
        // 这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        var node = new cc.Node();
        node.parent = cc.director.getScene();
        node.x = cc.visibleRect.width * 0.5
        node.y = cc.visibleRect.height * 0.5

        var camera = node.addComponent(cc.Camera);
        camera.targetTexture = texture;
        camera.enabled = true

        // 渲染一次摄像机，即更新一次内容到 RenderTexture 中
        camera.render();

        // 这样我们就能从 RenderTexture 中获取到数据了
        var data = texture.readPixels();

        // 获取到的截图数据是颠倒的，我们要处理data
        // 用 filpYImage 函数把图捋顺喽(该函数在第一部分第2条)
        var width = texture.width
        var height = texture.height
        console.log(width, height);

        var picData = this.filpYImage(data, width, height)

        camera.enabled = false
        node.removeFromParent()
        uiManager.close(this)

        // 1、如果你想本地测试一下截图是否成功，可以打开下面这段注释
        // var spriteFrame = new cc.SpriteFrame()
        // spriteFrame.setTexture(texture)

        // var sprite_node = new cc.Node()
        // var sprite = sprite_node.addComponent(cc.Sprite)
        // sprite.spriteFrame = spriteFrame
        // cc.director.getScene().addChild(sprite_node)
        // sprite_node.x = 375;
        // sprite_node.y = 667;

        // 2、将截图传递给Native设备，设置一下可读写路径，并返回该路径
        var filePath = jsb.fileUtils.getWritablePath() + 'render_to_image.png';
        var succeed = jsb.saveImageData(picData, width, height, filePath)
        if (succeed) {
            // 路径设置成功之后，我们开始分享                
            // 调用java交互访问第二大部分的函数share_img
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "share_img", "(Ljava/lang/String;II)V", filePath, width, height);

            // jsb.reflection.callStaticMethod
            //     (
            //         packageName.replace(/\./g, '/') + "/SDKInterfaces",   //包名 + SDK文件
            //         "share_img",    //调用SDK中的share_img函数(在第二部分)
            //         "(Ljava/lang/String;II)V",  //函数的参数类型
            //         filePath,
            //         width,
            //         height
            //     )
        }
    }


    filpYImage(data, width, height) {
        var picData = new Uint8Array(width * height * 4)
        var rowBytes = width * 4
        for (var row = 0; row < height; row++) {
            var srow = height - 1 - row
            var start = srow * width * 4
            var reStart = row * width * 4

            for (var i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i]
            }
        }
        return picData
    }


}


