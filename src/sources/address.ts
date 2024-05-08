export interface PublicIp {
  publicIp: string
}

/**
 * @see https://www.browserleaks.com/canvas#how-does-it-work
 *
 * A version of the entropy source with stabilization to make it suitable for static fingerprinting.
 * Canvas image is noised in private mode of Safari 17, so image rendering is skipped in Safari 17.
 */
export default function getAddress(): Promise<PublicIp> {
  return getUnstableAddress()
}

function getPublicIp(): any {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    function handleCandidate(candidate: any) {
      var ip_addr: any = ''
      if (candidate.match(/^(192\.127\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
        //local IPs
      } else if (candidate.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)) {
        //IPv6 addresses
      } else {
        //assume the rest are public IPs
        ip_addr = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/)[1]
      }

      //不用延时获取 可用的 公网ip
      var lines = pc.localDescription?.sdp.split('\n')
      lines?.forEach(function (line) {
        if (line.indexOf('a=candidate:') === 0) {
          //assume the rest are public IPs
          let lineIp = line.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/)
          if (lineIp) {
            if (lineIp[1].indexOf('172') === 0 || lineIp[1].indexOf('192') === 0) {
              //是内网ip就不赋值
            } else {
              ip_addr = lineIp[1]
            }
          }
        }
      })
      if (ip_addr.indexOf('172') === 0 || ip_addr.indexOf('192') === 0) {
        ip_addr = ''
      }

      if (ip_addr) {
        resolve(ip_addr)
      } else {
        resolve('')
      }
    }
    pc.onicecandidate = function (ice) {
      if (ice.candidate) {
        handleCandidate(ice.candidate.candidate)
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
    // setTimeout(function () {
    //   var lines = pc.localDescription?.sdp.split('\n')
    //   lines?.forEach(function (line) {
    //     if (line.indexOf('a=candidate:') === 0) {
    //       handleCandidate(line)
    //     }
    //   })
    // }, 2000)
  })
}

export async function getUnstableAddress(): Promise<PublicIp> {
  let publicIp: any = await getPublicIp()
  return { publicIp }
}
