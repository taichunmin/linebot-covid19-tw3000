const _ = require('lodash')
const GoogleAnalytics = require('../../lib/google-analytics')
const libErrorToJson = require('../../lib/error-to-json')

// 定義 Error.toJSON
if (!Error.prototype.toJSON) {
  Error.prototype.toJSON = function () { return libErrorToJson(this) } // eslint-disable-line
}

const handlers = {
  follow: require('./follow'),
  message: require('./message'),
  postback: require('./postback'),
  unfollow: require('./unfollow'),
}

const fnReplyMessage = ({ event, line }) => {
  return async msg => {
    if (_.get(event, 'replyed')) throw new Error('重複呼叫 event.replyMessage')
    _.set(event, 'replyed', 1)
    try {
      await line.replyMessage(event.replyToken, msg)
    } catch (err) {
      err.data = msg
      throw err
    }
  }
}

module.exports = async ({ req, event, line }) => {
  try {
    // 先把 event 記錄到 google cloud logging
    console.log('event =', JSON.stringify(event))

    // 如果是測試訊息就直接不處理
    if (_.get(event, 'source.userId') === 'Udeadbeefdeadbeefdeadbeefdeadbeef') return

    event.replyMessage = fnReplyMessage({ event, line }) // replyMessage 輔助函式
    const ga = new GoogleAnalytics(event.source.userId) // GA 初始化

    const eventType = _.get(event, 'type')
    if (_.hasIn(handlers, eventType)) await handlers[eventType]({ req, event, line, ga })

    await ga.flush() // 送出 GA 資料
  } catch (err) {
    console.log('line/handler err =', JSON.stringify(err))
    await event.replyMessage(require('../view/error')(err.message))
  }
}
