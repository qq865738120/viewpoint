
export const px2Rpx = px => {
  const sysInfo = wx.getSystemInfoSync();
  return px * 750 / sysInfo.windowWidth
}

export const isNull = value => {
  const isEmpty = typeof value === "string" && value === "";
  const isNaN = typeof value === "number" && Number.isNaN(value);
  return value === null || value === undefined || isEmpty || isNaN;
};

export const isEmptyObj = value => {
  if (typeof value === "undefined" || value === null || typeof value !== "object") {
    return true;
  }
  for (const key of Object.keys(value)) {
    return false;
  }
  return true;
};

export function getIn(data, paths, noSetValue) {
  if (isNull(data) || isEmptyObj(paths)) {
    return noSetValue;
  }
  let result = data;
  try {
    while (paths.length > 0) {
      result = result[paths.shift()];
    }
  } catch (e) {
    result = noSetValue;
  }
  return typeof result === "undefined" ? noSetValue : result;
}