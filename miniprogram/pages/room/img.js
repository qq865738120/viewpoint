export default class LastMayday {
  palette(data) {
    console.log("imageData", data)

    return ({
      background: '#161825',
      width: '700rpx',
      height: '1050rpx',
      borderRadius: '30rpx',
      views: [{
        type: 'image',
        url: data.firstFrameImgSrc,
        css: {
          top: '40rpx',
          left: '40rpx',
          width: '620rpx',
          height: '700rpx'
        },
      },
      {
        type: 'text',
        text: data.shareTitle,
        css: {
          color: "#fff",
          fontSize: "34rpx",
          lineHeight: "40rpx",
          top: "800rpx",
          left: '40rpx',
          width: "380rpx"
        }
      },
      {
        type: 'image',
        url: data.miniQrCodeUrl,
        css: {
          top: "800rpx",
          right: '40rpx',
          width: "200rpx",
          height: "200rpx"
        }
      }
      ],
    });
  }
}