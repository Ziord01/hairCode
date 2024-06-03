import Hilo from 'hilojs'
import Asset from './Asset'
import Gold from './Gold'
import Hand from './Hand'
export default class Game {
    constructor(vueInstance) {
        this.vueInstance = vueInstance // 保存 Vue 实例的引用

        // 画布信息
        this.pageEle = null
        this.width = innerWidth * 2
        this.height = innerHeight * 2
        this.scale = 0.5

        // 游戏相关
        this.stage = null
        this.asset = new Asset()
        this.ticker = null
        this.golds = null
        this.goldIdList = [] // 生成下落元素的字符串
        this.dropSpeed = 600 // 下落速度
        this.createSpeed = 500 // 初始速度
        this.handEle = null
        this.btnBegin = null
        this.ruleImgBitMap = null
        this.btnText = null
        this.btnText2 = null
        this.countdownText = null // 倒计时文本
        this.score = 0 // 游戏总分
        this.initGameTime = 30 // 游戏总时间
        this.gameTime = 0 // 当前游戏剩余时间
        this.gameStatus = 'ready' // 当前游戏状态
    }

    init() {
        // 加载资源，加载完毕后，初始化舞台
        this.asset.on('complete', function () {
            this.asset.off('complete')
            this.initStage()
        }.bind(this))
        this.asset.load()
    }

    initStage() {
        this.stage = new Hilo.Stage({
            renderType: 'canvas',
            width: this.width,
            height: this.height,
            scaleX: this.scale,
            scaleY: this.scale,
            container: this.pageEle
        })
        // 要让舞台上的可视对象响应用户交互，必须先使用此方法开启舞台的相应事件的响应。
        this.stage.enableDOMEvent([Hilo.event.POINTER_START, Hilo.event.POINTER_MOVE, Hilo.event.POINTER_END])
        // 启动定时器刷新页面 参数为帧率
        this.ticker = new Hilo.Ticker(60)
        // 舞台添加到定时队列中
        this.ticker.addTick(this.stage)
        // 添加动画类到定时队列
        this.ticker.addTick(Hilo.Tween)
        // 启动ticker
        this.ticker.start(true)

        this.initBg()
        this.initRule()
        this.initBeginBtn()
    }

    // 初始化游戏背景
    initBg() {
        const bgImg = this.asset.bg
        new Hilo.Bitmap({
            id: 'bg',
            image: bgImg,
            scaleX: this.width / bgImg.width,
            scaleY: this.height / bgImg.height
        }).addTo(this.stage)

        const logoImg = this.asset.logo;
        new Hilo.Bitmap({
            id: 'logo',
            image: logoImg,
            x: this.width - logoImg.width - 20, // 右边距20像素
            y: 20, // 上边距20像素
            pointerEnabled: false // 确保 logo 不响应点击事件
        }).addTo(this.stage, 1); // 将 logo 添加到舞台，层级为1
    }

    //增加规则
    initRule(){
        const ruleImg = this.asset.rule;
        this.ruleImgBitMap = new Hilo.Bitmap({
            id: 'rule',
            image: ruleImg,
            x: 0, // 左边距0像素
            y: 0, // 上边距0像素
            pointerEnabled: false // 确保 rule 不响应点击事件
        }).addTo(this.stage, 2); // 将 rule 添加到舞台，层级为2
    }

    // 初始化开始按钮
    initBeginBtn() {
        console.log('initBeginBtn')
        const btnImg = this.asset.beginBtn
        this.btnBegin = new Hilo.Bitmap({
            id: 'btnBegin',
            image: btnImg,
            x: (this.width - btnImg.width) / 2,
            y: (this.height - btnImg.height) / 2,
            rect: [0, 0, btnImg.width, btnImg.height]
        }).addTo(this.stage, 2)

        // 添加文本
        this.btnText = new Hilo.Text({
            id: 'btnText',
            text: '完成游戏得优惠券',
            color: 'black',
            font: '35px Arial',
            textAlign: 'center',
            height: -150,
            width: 180,
            maxWidth: this.width, // 设置文本的最大宽度
            lineHeight: 2, // 确保文本行高为1，不会换行
            x: this.width / 2,
            y: (this.height - btnImg.height ) / 2 + btnImg.height / 4
        }).addTo(this.stage, 2)

        // 设置文本居中对齐
        this.btnText.pivotX = this.btnText.width  / 2
        this.btnText.pivotY = this.btnText.height  / 2

        this.btnText2 = new Hilo.Text({
            id: 'btnText2',
            text: '游戏规则：头发+2分，干草和生姜+1分，蛋糕扣1分 零分以及碰到炸弹结束。',
            color: 'black',
            font: '35px Arial',
            textAlign: 'center',
            height: -250,
            width: 180,
            maxWidth: this.width, // 设置文本的最大宽度
            lineHeight: 2, // 确保文本行高为1，不会换行
            x: this.width / 2,
            y: (this.height - btnImg.height ) / 2 + btnImg.height / 4
        }).addTo(this.stage, 2)

        // 设置文本居中对齐
        this.btnText2.pivotX = this.btnText2.width  / 2
        this.btnText2.pivotY = this.btnText2.height  / 2
        // this.btnBegin.on(Hilo.event.POINTER_START, this.startGame.bind(this))

        // 绑定点击事件显示倒计时
        this.btnBegin.on(Hilo.event.POINTER_START, this.showCountdown.bind(this))
    }

    // 显示倒计时
    showCountdown() {
        this.btnBegin.visible = false
        this.btnText.visible = false
        this.btnText2.visible = false
        this.ruleImgBitMap.visible = false

        let countdown = 3
        this.countdownText = new Hilo.Text({
            text: countdown,
            color: 'red',
            font: '150px Arial',
            textAlign: 'center',
            width: 0,
            height: 0,
            x: this.width / 2,
            y: this.height / 2
        }).addTo(this.stage, 2)

        const interval = setInterval(() => {
            countdown -= 1
            if (countdown <= 0) {
                clearInterval(interval)
                this.countdownText.removeFromParent()
                this.startGame()
            } else {
                this.countdownText.text = countdown
            }
        }, 1000)
    }
    // 开始游戏
    startGame() {
        this.initGold()
        this.initHand()
        // 舞台更新
        // this.stage.removeChild(this.btnBegin)
        // this.stage.removeChild(this.ruleImgBitMap) // 规则
        // this.stage.removeChild(this.btnText) // 移除文本
        // this.stage.removeChild(this.btnText2) // 移除文本
        this.stage.onUpdate = this.onUpdate.bind(this)
        this.gameTime = this.initGameTime
        this.score = 0
        this.gameStatus = 'play'
        this.calcTime()

        // 将 startGame 设置为 true
        this.vueInstance.startGame = true // 直接更新 Vue 实例的属性
    }

    // 游戏结束
    gameOver() {
        // 停止生成新的下落元素
        this.gameTime = 0
        this.golds.stopCreateGold()
        this.stage.removeChild(this.handEle)
        this.stage.removeChild(this.golds)
        this.initBeginBtn()
    }

    // 游戏倒计时
    calcTime() {
        setTimeout(() => {
            if(this.gameTime > 0) {
                this.gameTime--
                this.calcTime()
            } else {
                if(this.gameStatus !== 'bomb') {
                    this.gameStatus = 'end'
                    this.gameOver()
                }
            }
        }, 1000)
    }

    // 初始化下落元素
    initGold() {
        // 假数据：下落元素
        const listStr = '2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r2ab0r'
        this.goldIdList = listStr.split('')
        this.golds = new Gold({
            id: 'golds',
            height: this.height,
            width: this.width,
            dropSpeed: this.dropSpeed,
            createSpeed: this.createSpeed,
            pointerEnabled: false, // 不关闭事件绑定 无法操作舞台
            dropEleArr: [this.asset.bigCoin, this.asset.smallCoin,this.asset.smallCoin2, this.asset.loseCoin, this.asset.bomb],
            goldIdList: this.goldIdList
        }).addTo(this.stage, 2)
    }

    // 初始化接金币元素
    initHand() {
        const handImg = this.asset.hand
        this.handEle = new Hand({
            id: 'handEle',
            img: handImg,
            height: handImg.height,
            width: handImg.width,
            x: (this.width - handImg.width) / 2,
            y: this.height - handImg.height - 80
        }).addTo(this.stage, 1)
        // 为hand增加拖拽功能
        Hilo.util.copy(this.handEle, Hilo.drag)
        // 开始拖拽，拖拽范围，基于父容器坐标系，[x, y, width, height]
        this.handEle.startDrag([
            -handImg.width / 4,
            this.height - handImg.height - 80,
            this.width - handImg.width / 2,
            0
        ])
    }

    // 更新舞台
    onUpdate() {
        if(this.gameStatus === 'ready') {
            return false
        }
        // 检测碰撞
        this.golds.children.forEach(item => {
            if(this.handEle.checkCollision(item)) {
                item.over()
                // 接到减分，且当前没有积分；或接到炸弹
                if((item.score === -1 && this.score === 0) || item.score === 0) {
                    this.gameStatus = 'bomb'
                    this.gameOver()
                } else {
                    this.score += item.score
                }
            }
        })
    }
}
