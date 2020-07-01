const _ = require('lodash')

exports.googleMapDir = post => {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', 1)
  url.searchParams.set('destination', `${_.get(post, 'lat', 0)},${_.get(post, 'lng', 0)}`)
  url.searchParams.set('travelmode', 'driving')
  url.searchParams.set('openExternalBrowser', 1)
  return url.href
}

const renderHorizontalField = (name, value) => ({
  type: 'box',
  layout: 'horizontal',
  spacing: 'sm',
  contents: [
    {
      color: '#32CD32',
      flex: 0,
      size: 'sm',
      text: name,
      type: 'text',
    },
    {
      align: 'end',
      flex: 1,
      text: `${value}`,
      type: 'text',
    },
  ],
})

const renderTel = tel => ({
  type: 'box',
  layout: 'horizontal',
  spacing: 'sm',
  contents: [
    {
      color: '#32CD32',
      flex: 0,
      size: 'sm',
      text: '聯絡電話',
      type: 'text',
    },
    {
      align: 'end',
      color: '#5672c6',
      decoration: 'underline',
      text: tel,
      type: 'text',
      action: {
        label: '連絡電話',
        type: 'uri',
        uri: `tel:${tel}`,
      },
    },
  ],
})

const renderVerticalField = (name, value) => ({
  type: 'box',
  layout: 'vertical',
  spacing: 'sm',
  contents: [
    {
      color: '#32CD32',
      size: 'sm',
      text: name,
      type: 'text',
    },
    {
      align: 'end',
      size: 'sm',
      text: `${value}`,
      type: 'text',
      wrap: true,
    },
  ],
})

const formatDistance = distance => distance < 1000 ? `約 ${_.round(distance)} 公尺` : `約 ${_.round(distance / 1000, 1)} 公里`

const renderPost = post => ({
  type: 'bubble',
  size: 'kilo',
  header: {
    type: 'box',
    layout: 'vertical',
    backgroundColor: '#008AD2',
    contents: [{
      align: 'center',
      color: '#FFFFFF',
      size: 'lg',
      text: post.name,
      type: 'text',
      weight: 'bold',
    }],
  },
  body: {
    type: 'box',
    layout: 'vertical',
    spacing: 'md',
    contents: [
      renderHorizontalField('直線距離', formatDistance(post.distance)),
      renderTel(post.tel),
      renderHorizontalField('剩餘數量', post.amount),
      renderHorizontalField('更新時間', post.updated_at.utcOffset(8).format('MM/DD')),
      renderVerticalField('營業時間', post.busiTime),
      renderVerticalField('營業備註', post.busiMemo || '無'),
    ],
  },
  footer: {
    type: 'box',
    layout: 'horizontal',
    contents: [{
      type: 'button',
      style: 'primary',
      color: '#000000',
      action: {
        label: '點此開啟導航',
        type: 'uri',
        uri: exports.googleMapDir(post),
      },
    }],
  },
})

module.exports = ({ posts, lat, lng, addr }) => [
  {
    type: 'text',
    text: '以下是直線距離 10 公里內可以領取振興三倍券的郵局：',
  },
  {
    type: 'flex',
    altText: '以下是直線距離 10 公里內可以領取振興三倍券的郵局',
    contents: {
      type: 'carousel',
      contents: _.map(posts, renderPost),
    },
    quickReply: {
      items: [
        {
          type: 'action',
          imageUrl: 'https://i.imgur.com/yYoajLF.png',
          action: {
            type: 'postback',
            label: '重查',
            data: JSON.stringify(['nearbyPost', { lat, lng, addr }]),
          },
        },
        {
          type: 'action',
          action: {
            type: 'location',
            label: '上傳新的定位',
          },
        },
      ],
    },
  },
]
