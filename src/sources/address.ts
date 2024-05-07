
export interface PublicIp {
  publicIp: string
  localIp: string
}

/**
 * @see https://www.browserleaks.com/canvas#how-does-it-work
 *
 * A version of the entropy source with stabilization to make it suitable for static fingerprinting.
 * Canvas image is noised in private mode of Safari 17, so image rendering is skipped in Safari 17.
 */
export default function getAddress(): Promise<PublicIp> {
  // console.log('1344444---------', getUnstableCanvasFingerprint(doesBrowserPerformAntifingerprinting()))

  return getUnstableAddress()
}
export async function getPublicIp(callback: any) {
  var ip_dups: any = {}
  var RTCPeerConnection = window.RTCPeerConnection
  var servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  }
  var pc = new RTCPeerConnection(servers)
  function handleCandidate(candidate: any) {
    var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
    var ip_addr: any = ip_regex.exec(candidate)
    if (ip_addr) {
      ip_addr = ip_addr[1]
    }
    if (ip_dups[ip_addr] === undefined) {
      if (typeof callback === 'function') {
        sessionStorage.setItem('publicIp', ip_addr)
        return callback(ip_addr)
      }
    }
  }
  pc.onicecandidate = function (ice) {
    if (ice.candidate) {
      handleCandidate(ice.candidate.candidate)
    } else if (ice.candidate) {
    }
  }
  pc.createDataChannel('')
  pc.createOffer(
    function (result) {
      pc.setLocalDescription(
        result,
        function () {},
        function () {},
      )
    },
    function () {},
  )
  setTimeout(function () {
    var lines = pc.localDescription?.sdp.split('\n')
    lines?.forEach(function (line) {
      if (line.indexOf('a=candidate:') === 0) {
        handleCandidate(line)
      }
    })
  }, 1000)
}
/**
 * A version of the entropy source without stabilization.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */

export async function getUnstableAddress(): Promise<PublicIp> {
  let publicIp: any
  let localIp: string = await getLocalIP()
  publicIp = sessionStorage.getItem('publicIp')
  return { publicIp, localIp }
}

function getLocalIP(): any {
  return new Promise((resolve, reject) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [],
    })

    peerConnection.createDataChannel('')
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

