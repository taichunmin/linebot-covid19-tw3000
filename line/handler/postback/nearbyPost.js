const _ = require('lodash')
const libPost = require('../../../lib/post')

module.exports = async ({ req, event, line, ga, args }) => {
  const { lat, lng, addr } = _.get(args, '0', {})
  const posts = await libPost.nearbyPosts({ lat, lng })
  if (!posts.length) {
    ga.screenView('附近郵局：再次查詢無結果')
    ga.event('附近郵局：再次查詢無結果', '上傳定位', { el: `${addr} (${lat}, ${lng})` })
    return await event.replyMessage(require('../../view/nearby-post/not-found')())
  }
  ga.screenView('附近郵局：再次查詢')
  ga.event('附近郵局：再次查詢', '上傳定位', { el: `${addr} (${lat}, ${lng})` })
  ga.event('附近郵局：再次查詢', '結果', { el: _.map(posts, 'id').join() })
  return await event.replyMessage(require('../../view/nearby-post/result')({ posts, lat, lng, addr }))
}
