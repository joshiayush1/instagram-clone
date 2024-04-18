const ipt = document.querySelector("#ipt");
const iptbtn = document.querySelector("#iptbtn");
const btn = document.querySelector("#btn");
const form = document.querySelector("#form");

iptbtn.addEventListener("click", function(){
    ipt.click();
})

btn.addEventListener("click", function(){
    form.submit();
})