const _ = require('lodash')
const { abs, sin, cos, PI, atan2, sqrt } = Math
const axios = require('axios')
const getenv = require('../lib/getenv')
const Joi = require('@hapi/joi')
const moment = require('../lib/moment')

/**
 * 多少距離才能算是附近（單位：公尺）
 */
exports.NEARBY_DISTANCE = 10000

/**
 * 地球的半徑（單位：公尺）
 */
exports.EARTH_RADIUS = 6371e3

/**
 * 經緯度每一度的大約距離（單位：公尺）
 * 透過 `haversineDistance(0, 0, 1, 0)` 得來
 */
exports.DISTANCE_PER_DEGREE = 111194.92664455874

/**
 * 多少經緯度內才能算是附近
 */
exports.NEARBY_DEGREE = exports.NEARBY_DISTANCE / exports.DISTANCE_PER_DEGREE

/**
 * 把角度 deg 轉成 rad
 *
 * @param float x
 * @return float
 */
exports.degreeToRad = (x) => {
  return x * PI / 180.0
}

/**
 * 計算兩個經緯度之間的距離
 * @param float aLat A 點的緯度
 * @param float aLng A 點的經度
 * @param float bLat B 點的緯度
 * @param float bLng B 點的經度
 * @return float 兩點之間的距離
 * @see https://github.com/dcousens/haversine-distance/blob/master/index.js
 * @see https://www.movable-type.co.uk/scripts/latlong.html
 */
exports.haversineDistance = (aLat, aLng, bLat, bLng) => {
  const dLat = exports.degreeToRad(bLat - aLat)
  const dLng = exports.degreeToRad(bLng - aLng)

  const f = sin(dLat / 2) ** 2 + cos(exports.degreeToRad(aLat)) * cos(exports.degreeToRad(bLat)) * sin(dLng / 2) ** 2
  const c = 2 * atan2(sqrt(f), sqrt(1 - f))
  return exports.EARTH_RADIUS * c
}

exports.validatePost = (() => {
  const schema = Joi.object({
    busiMemo: Joi.string().replace('<br>', '\n').empty('').optional(),
    busiTime: Joi.string().replace('<br>', '\n').empty('').required(),
    latitude: Joi.number().min(21).max(28).empty('0').required(),
    longitude: Joi.number().min(117).max(123).empty('0').required(),
    storeCd: Joi.number().integer().required(),
    storeNm: Joi.string().replace(/\([^)]+\)$/, '').empty('').required(),
    tel: Joi.string().replace(/^\((\d+)\)/, '$1-').replace(/轉(\d+)$/, ',$1').replace(/、(\d+)$/, '').replace(/^(\d+)-(\d+)-(\d+)$/, '$1-$2$3').replace(/^(\d+)-(\d+)-(\d+)[-,](\d+)$/, '$1-$2$3,$4').empty('').required(),
    total: Joi.number().integer().min(0).required(),
    updateDate: Joi.string().regex(/^\d{8}$/).empty('').required(),
  })
  return value => schema.validateAsync(value, { stripUnknown: true })
})()

const JSON_POSTS = getenv('JSON_POSTS', 'https://3000.gov.tw/hpgapi-openmap/api/getPostData')
// const JSON_POSTS = getenv('JSON_POSTS', 'https://quality.data.gov.tw/dq_download_json.php?nid=127751&md5_url=ff02dedeecfbc115c19dd0dd37db17f4')
// const JSON_POSTS = getenv('JSON_POSTS', 'https://gist.github.com/taichunmin/6b0a9ab59f929b41bcf7572abb506ce3/raw/covid19-tw3000-posts.json')

exports.getPosts = async () => {
  let posts = _.get(await axios.get(JSON_POSTS, { params: { t: +new Date() } }), 'data', [])
  posts = _.filter(await Promise.all(_.map(posts, async post => {
    try {
      post = await exports.validatePost(post)
      return {
        id: post.storeCd,
        name: post.storeNm,
        tel: post.tel,
        busiTime: _.trim(post.busiTime),
        busiMemo: _.trim(post.busiMemo),
        lat: post.latitude,
        lng: post.longitude,
        amount: post.total,
        updated_at: moment(`${post.updateDate}+08`, 'YYYYMMDDZZZ'),
      }
    } catch (err) {
      return null
    }
  })))
  if (!posts.length) throw new Error('很抱歉，機器人目前沒有抓到政府提供的資料。')
  return posts
}

exports.nearbyPosts = async ({ lat, lng }) => {
  return _.slice(_.sortBy(_.filter(await exports.getPosts(), post => {
    if (abs(post.lat - lat) > exports.NEARBY_DEGREE) return false
    if (abs(post.lng - lng) > exports.NEARBY_DEGREE) return false
    post.distance = exports.haversineDistance(lat, lng, post.lat, post.lng)
    if (post.distance > exports.NEARBY_DISTANCE) return false
    return true
  }), 'distance'), 0, 10)
}
