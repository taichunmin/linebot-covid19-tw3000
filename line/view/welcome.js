module.exports = () => ({
  type: 'text',
  text: '你好，歡迎使用振興三倍券查詢器，請直接點選下方「上傳定位」進行查詢。',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'location',
          label: '上傳定位',
        },
      },
    ],
  },
})
