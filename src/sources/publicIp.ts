// 使用Promise来等待获取IP地址
export default function getPublicIp(callback: any) {
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
        callback(ip_addr)
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
