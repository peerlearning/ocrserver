"use strict"; // ES6
window.onload = () => {

  var http = {
    post: (path, data) => {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", path, true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState == XMLHttpRequest.DONE) return resolve(xhr);
        };
        xhr.send(data);
      });
    },

    get: (path, data) => {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState == XMLHttpRequest.DONE) return resolve(xhr);
        };
        xhr.send(data);
      });
    }
  };


  var ui = {
    output:    document.getElementById("output"),
    image:     document.querySelector("img#img"),
    btnFile:   document.getElementById("by-file"),
    btnBase64: document.getElementById("by-base64"),
    cancel:    document.getElementById("cancel-input"),
    file:      document.getElementById("file"),
    langs:     document.querySelector("input[name=langs]"),
    whitelist: document.querySelector("input[name=whitelist]"),
    hocr:      document.querySelector("input[name=hocr]"),
    submit:    document.getElementById("submit"),
    loading:   document.querySelector("button#submit>span:first-child"),
    standby:   document.querySelector("button#submit>span:last-child"),
    show:      uri => ui.image.setAttribute("src", uri),
    clear:     () => { ui.image.setAttribute("src", ""), ui.file.value = ''; },
    start:     () => { ui.loading.style.display = "block"; ui.standby.style.display = "none"; ui.submit.setAttribute("disabled", true); ui.output.innerText = "{}"; },
    finish:    () => { ui.loading.style.display = "none"; ui.standby.style.display = "block"; ui.submit.removeAttribute("disabled"); },
  };

  // ui.file.addEventListener("change", ev => {
  //   if (!ev.target.files || !ev.target.files.length) return null;
  //   const r = new FileReader();
  //   r.onload = e => ui.show(e.target.result);
  //   r.readAsDataURL(ev.target.files[0]);
  // });
  // ui.btnFile.addEventListener("click", () => ui.file.click());
  // ui.btnBase64.addEventListener("click", () => {
  //   const uri = window.prompt("Please paste your base64 image URI");
  //   if (uri) { ui.clear(); ui.show(uri); }
  // });
  // ui.cancel.addEventListener("click", () => ui.clear());
  // ui.submit.addEventListener("click", () => {
  //   ui.start();
  //   const req = generateRequest();
  //   doOCRandGetSimilarQuestions(req);
    
  // })

  function doOCRandGetSimilarQuestions(req) {
    if (!req) return ui.finish();
    http.post(req.path, req.data).then(xhr => {
      status = xhr.status;
      console.log(xhr)
      const r = JSON.parse(xhr.response);
      var q_r = {"text": r};
      const subject = encodeURI("Physics");
      const question_text  = encodeURI(r.result)

      const path = "https://chatbot-dot-flagsdashboard.appspot.com/api/v1/problems";
      const req_url = path + "?subject=" + subject + "&question_text=" + question_text;
      console.log(req_url)
      http.get(req_url, "").then(resp => {
        q_r["result"] = (JSON.parse(resp.response));
        ui.output.innerText =`${resp.status} ${resp.statusText}\n-----\n${ JSON.stringify(q_r, null, 2)}`;
        ui.finish();
      })
      
    });
  }

    // save on click
  save.addEventListener('click', e => {
    e.preventDefault();
    ui.start();
    // get result to data uri
    // let imgSrc = cropper.getCroppedCanvas({
    //   width: img_w.value // input value
    // }).toDataURL();
    // // remove hide class of img
    // cropped.classList.remove('hide');
    // img_result.classList.remove('hide');
    // // show image cropped
    // // cropped.src = imgSrc;
    // // dwn.classList.remove('hide');
    // // dwn.download = 'imagename.png';
    // // dwn.setAttribute('href', imgSrc);
    cropper.getCroppedCanvas().toBlob(function (blob) {
      var req = {path: "/file", data: null};
      req.data = new FormData();
      req.data.append("file", blob);
      doOCRandGetSimilarQuestions(req);
    });
  });

  var generateRequest = () => {
    var req = {path: "", data: null};
    if (ui.file.files && ui.file.files.length != 0) {
      req.path = "/file";
      req.data = new FormData();
      if (ui.langs.value) req.data.append("languages", ui.langs.value);
      if (ui.whitelist.value) req.data.append("whitelist", ui.whitelist.value);
      if (ui.hocr.checked) req.data.append("format", "hocr");
      req.data.append("file", ui.file.files[0]);
    } else if (/^data:.+/.test(ui.image.src)) {
      req.path = "/base64";
      var data = {base64: ui.image.src};
      if (ui.langs.value) data["languages"] = ui.langs.value;
      if (ui.whitelist.value) data["whitelist"] = ui.whitelist.value;
      if (ui.hocr.checked) data["format"] = "hocr";
      req.data = JSON.stringify(data);
    } else {
      return window.alert("no image input set");
    }
    return req;
  };
};

