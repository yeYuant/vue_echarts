export default class SocketService {
    // 单例
    static instance = null
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }


    // 和服务端连接的socket对象
    ws = null

    // 存储回调函数
    callBackMapping = {}

    connected = false

    // 记录重试的次数
    sendRetryCount = 0

    // 连接失败后,重试的次数
    connectRetryCount = 0

    // 定义连接服务器的方法
    connect() {
        // 连接服务器
        if (!window.WebSocket) {
            return console.log('您的浏览器不支持WebSocket')
        }
        this.ws = new WebSocket('ws://localhost:9998')

        // 连接成功的事件
        this.ws.onopen = () => {
            console.log('服务器连接成功');
            this.connected = true
            // 重新连接的次数
            this.connectRetryCount = 0
        }

        // 1.连接失败的事件
        // 2.服务器连接成功之后,服务器关闭的情况
        this.ws.opclose = () => {
            console.log('连接服务端失败');
            this.connected = false
            this.connectRetryCount++
            setTimeout(() => {
                this.connect()
            }, this.connectRetryCount * 500)
        }

        // 得到从服务端发送过来的数据
        this.ws.onmessage = msg => {
            console.log('得到了从服务端发送过来的数据');
            // 真正从服务端发送过来的数据在msg中的data字段中
            const recvData = JSON.parse(msg.data)
            const socketType = recvData.socketType
            // 判断回调函数是否存在
            if (this.callBackMapping[socketType]) {
                const action = recvData.action
                if (action === 'getData') {
                    const realData = JSON.parse(recvData.data)
                    this.callBackMapping[socketType].call(this, realData)
                } else if (action === 'fullScreen') {

                } else if (action === 'themeChange') {

                }
            }
        }
    }

    // 回调函数的注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 取消某一个回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    // 发送数据的方法
    send(data) {
        if (this.connected) {
            this.ws.send(JSON.stringify(data))
            this.sendRetryCount = 0
        }
        else {
            this.sendRetryCount++
            setTimeout(() => {
                this.send(data)
            }, 500 * this.sendRetryCount)
        }
    }
}