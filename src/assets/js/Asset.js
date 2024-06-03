import Hilo from 'hilojs'
export default Hilo.Class.create({
    Mixes: Hilo.EventMixin, // 为了暴露加载完毕事件
    queue: null, // 资源下载类
    bg: null, // 背景
    bigCoin: null, // 大金币
    smallCoin: null, // 小金币1
    smallCoin2: null, // 小金币2
    loseCoin: null, // 减少金币
    bomb: null, // 炸弹
    hand: null, // 手
    beginBtn: null, // 开始按钮
    logo: null, // logo
    rule: null, // rule
    load() {
        /* 如使用本地资源，需注意图片是否太小，
        被打成base64到js文件中，这样会无法到达complete状态 */
        const resources = [
            { id: 'bg', crossOrigin: true, src: require('../images/bg1.jpg') },
            // { id: 'bg', crossOrigin: true, src: require('../src/assets/images/1.jpg') },
            { id: 'bigCoin', crossOrigin: true, src: require('../images/hair.png') },
            { id: 'smallCoin', crossOrigin: true, src: require('../images/shengjiang.png') },
            { id: 'smallCoin2', crossOrigin: true, src: require('../images/gancao.png') },
            { id: 'loseCoin', crossOrigin: true, src: require('../images/sweet.png') },
            { id: 'bomb', crossOrigin: true, src: require('../images/bomb.png') },
            { id: 'hand', crossOrigin: true, src: require('../images/hand.png') },
            { id: 'beginBtn', crossOrigin: true, src: require('../images/beginBtn.png') },
            { id: 'logo', crossOrigin: true, src: require('../images/logo.png') },
            { id: 'rule', crossOrigin: true, src: require('../images/rules.png') }
        ]
        this.queue = new Hilo.LoadQueue() // 创建下载类。
        this.queue.add(resources)
        // 加载完毕后执行onComplete方法。监听事件"load"、"error"也可如此用
        this.queue.on('complete', this.onComplete.bind(this))
        this.queue.start() // 开始下载队列。
    },
    onComplete() {
        // 根据获取资源内容。
        this.bg = this.queue.get('bg').content
        this.bigCoin = this.queue.get('bigCoin').content
        this.smallCoin = this.queue.get('smallCoin').content
        this.smallCoin2 = this.queue.get('smallCoin2').content
        this.loseCoin = this.queue.get('loseCoin').content
        this.bomb = this.queue.get('bomb').content
        this.hand = this.queue.get('hand').content
        this.beginBtn = this.queue.get('beginBtn').content
        this.logo = this.queue.get('logo').content
        this.rule = this.queue.get('rule').content
        this.queue.off('complete') // 删除下载队列的complete事件监听
        this.fire('complete') // 发送事件complete，类似Vue的广播$emit
    }
})
