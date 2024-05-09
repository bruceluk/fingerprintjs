var ifrm = document.createElement("iframe");
var fpjsvid = localStorage.getItem("_fpjsvid");
if(fpjsvid == null) {
    fpjsvid = ""
}
ifrm.setAttribute("src", "/fpjstest/index.html?token="+localStorage.getItem('token')+"&fpjsvid="+fpjsvid+"&referer="+window.btoa(location.href));
ifrm.style.width = "100%";
ifrm.style.height = "2000px";
document.body.appendChild(ifrm);

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    const prefix = "fpjsDone:"
    if (((typeof event.data) == "string") && 
        event.data.indexOf(prefix) == 0) {
        //document.body.removeChild(ifrm);
        localStorage.setItem("_fpjsvid", event.data.substring(prefix.length))
    }
}