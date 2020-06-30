const _ = require('lodash')
const libPost = require('../../../lib/post')

module.exports = async ({ req, event, line, ga }) => {
  const { latitude: lat, longitude: lng, address: addr } = _.get(event, 'message', {})
  const posts = await libPost.nearbyPosts({ lat, lng })
  if (!posts.length) {
    ga.screenView('附近郵局：查無結果')
    ga.event('附近郵局：查無結果', '上傳定位', { el: `${addr} (${lat}, ${lng})` })
    return await event.replyMessage(require('../../view/nearby-post/not-found')())
  }
  ga.screenView('附近郵局：查詢成功')
  ga.event('附近郵局：查詢成功', '上傳定位', { el: `${addr} (${lat}, ${lng})` })
  ga.event('附近郵局：查詢成功', '結果', { el: _.map(posts, 'id').join() })
  return await event.replyMessage(require('../../view/nearby-post/result')({ posts, lat, lng, addr }))
}
