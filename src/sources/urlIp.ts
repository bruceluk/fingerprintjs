export async function getLocalIP() {
  return await new Promise((resolve, reject) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [], // 不需要ICE服务器，因为我们只是想获取本地IP
    })

    peerConnection.createDataChannel('') // 创建一个数据通道，即使它不用来通信
    peerConnection
      .createOffer()
      .then((offer: any) => {
        peerConnection.setLocalDescription(offer)
        // 使用SDP来获取IP地址
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
        const ipMatch = ipRegex.exec(offer.sdp)
        const ipAddress = ipMatch ? ipMatch[1] : ''
        resolve(ipAddress)
      })
      .catch((error) => {
        peerConnection.close()
        reject(error)
      })
  })
}
export default function getIp(): any {
  return getLocalIP()
    .then((ip: any) => {
      return ip
    })
    .catch((error) => {
      console.error('Error getting local IP:', error)
    })
}
