let fields = document.querySelectorAll(".input");
const socket = io();

document.querySelector("#submit").addEventListener("click",()=>{
    if(fields[2].value != 20){
        if(fields[0].checkValidity() && fields[1].checkValidity() && !fields[2].validity.valueMissing/* && fields[2].validity.rangeOverflow && fields[2].validity.UnderOverflow*/){
            socket.emit("login",[...fields].map(el=>el.value));
            socket.emit("Student");
        }else{
            alertify.error('Proszę wypełnić wszystkie pola');
        }
    }else{
        alertify.prompt("Proszę podać hasło: ","",(evt,value)=>{
            socket.emit("login",["Teacher","Teacher",20]);
            socket.emit("Teacher",value);
        })
    }
});

socket.on('LoginOccupied', (msg) => {
    alertify.error(msg);
  });

socket.on('Passed',(msg)=>{
    alertify.success(`Logged in as ${msg}`);
    document.querySelector("#login").style.display = "none";
    if(msg == 'Nauczyciel'){
        document.querySelector("#teacher").innerHTML = `${build().toString()}`;
        document.querySelector("#student").innerHTML = ``;
    }else{
        document.querySelector("#student").style.display = "flex";
        let CB = document.querySelector("#CB");
        CB.addEventListener("click",()=>{
            if(CB.checked == true){
                console.log("checked");
            }else{
                console.log("unchecked");
            }
        })
    }
});

function build(){
    let tab = [];
    for(let i = 0 ; i<19; i++){
        tab[i] = `<div id="D${i}"><span>a</span><span>a</span><span>a</span><input type="checkbox" name="CB" id="CB${i}" disabled></div>`
    }
    return tab.join("");
};