export interface WebRTC {
  publicIp: string
  privateIp: string
}

/**
 * @see https://www.browserleaks.com/canvas#how-does-it-work
 *
 * A version of the entropy source with stabilization to make it suitable for static fingerprinting.
 * Canvas image is noised in private mode of Safari 17, so image rendering is skipped in Safari 17.
 */
export default function getWebRTC(): Promise<WebRTC> {
  return new Promise((resolve) => {
    let publicIp = ''
    let privateIp = ''

    function foundIp(ip: string) {
      //local IPs
      if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
        privateIp = ip
      } else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)) {
        publicIp = ip
      } else {
        publicIp = ip
      }
    }

    //compatibility for firefox and chrome
    const RTCPeerConnection = window.RTCPeerConnection
    // || window.mozRTCPeerConnection || window.webkitRTCPeerConnection

    //bypass naive webrtc blocking using an iframe
    // if (!RTCPeerConnection) {
    //   const webRTCIFrame = document.getElementById('webRTCIFrame') as HTMLIFrameElement
    //   if (webRTCIFrame != null) {
    //     const win = webRTCIFrame.contentWindow
    //     if (win != null) {
    //       RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection
    //     }
    //   }
    // }

    //minimal requirements for data connection
    //const mediaConstraints = { optional: [{ RtpDataChannels: true }] }

    const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

    //construct a new RTCPeerConnection
    const pc = new RTCPeerConnection(servers) //, mediaConstraints)

    function handleCandidate(candidate: string) {
      //console.log(candidate)
      //match just the IP address
      const ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
      const ip_addrs = ip_regex.exec(candidate)
      if (ip_addrs != null) {
        foundIp(ip_addrs[1])
        if (privateIp != '' && publicIp != '') {
          resolve({ publicIp, privateIp })
        }
      }
    }

    //listen for candidate events
    pc.onicecandidate = function (ice: RTCPeerConnectionIceEvent) {
      //skip non-candidate events
      //console.log(ice)
      if (ice.candidate) {
        handleCandidate(ice.candidate.candidate)
      }
    }

    //create a bogus data channel
    pc.createDataChannel('')

    //create an offer sdp
    pc.createOffer(
      function (result) {
        //trigger the stun server request
        //console.log(result)
        pc.setLocalDescription(
          result,
          function () {
            // empty function
          },
          function () {
            // empty function
          },
        )
      },
      function () {
        // empty function
      },
    )

    //wait for a while to let everything done
    setTimeout(function () {
      //read candidate info from local description
      if (pc.localDescription != null) {
        const lines = pc.localDescription.sdp.split('\n')
        //console.log(lines)
        lines.forEach(function (line) {
          if (line.indexOf('a=candidate:') === 0) {
            handleCandidate(line)
          }
        })
      }
      resolve({ publicIp, privateIp })
    }, 1000)
  })
}
