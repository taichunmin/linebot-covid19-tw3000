module.exports = text => ({
  type: 'flex',
  altText: '在使用上面遇到問題了嗎？',
  contents: {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        ...(text ? [{
          type: 'text',
          text,
          wrap: true,
        }] : []),
        {
          type: 'text',
          text: '您可以點選左邊的按鈕跟開發者聯繫，或是右邊的按鈕重新查詢！',
          wrap: true,
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'md',
      contents: [
        {
          type: 'button',
          style: 'secondary',
          color: '#FFD700',
          action: {
            label: '與開發者聯繫',
            type: 'uri',
            uri: 'https://facebook.com/taichunmin?openExternalBrowser=1',
          },
        },
        {
          type: 'button',
          style: 'primary',
          color: '#000000',
          action: {
            label: '上傳定位',
            type: 'uri',
            uri: 'https://line.me/R/nv/location/',
          },
        },
      ],
    },
  },
})
