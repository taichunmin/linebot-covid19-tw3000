module.exports = () => ({
  type: 'text',
  text: '很抱歉，您上傳的位置附近沒有可以領取振興三倍券的場所，您可以點選下方「上傳新的定位」重新查詢。',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'location',
          label: '上傳新的定位',
        },
      },
    ],
  },
})
