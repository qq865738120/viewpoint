const promisify = name => option => {
  return new Promise((resolve, reject) =>
    wx[name]({
      ...option,
      success: resolve,
      fail: reject,
    })
  )
}

const wxPro = new Proxy(wx, {
  get(target, prop) {
    return promisify(prop)
  }
})

export default wxPro