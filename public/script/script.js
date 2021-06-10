let fields = document.querySelectorAll(".input");
const socket = io();
const User = {}

document.querySelector("#submit").addEventListener("click",()=>{
    if(fields[2].value != 20){
        if(fields[0].checkValidity() && fields[1].checkValidity() && !fields[2].validity.valueMissing/* && fields[2].validity.rangeOverflow && fields[2].validity.UnderOverflow*/){
            socket.emit("login",[...fields].map(el=>el.value));
            User[0] = [...fields].map(el=>el.value);
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
    alertify.success(`Zalogowano się jako ${msg}`);
    document.querySelector("#login").style.display = "none";
    if(msg == 'Nauczyciel'){
        document.querySelector("#teacher").innerHTML = `${build().toString()}`;
        document.querySelector("#student").innerHTML = ``;
        let CBs = document.querySelectorAll(".CB");
        let Trs = document.querySelectorAll("tr");
        socket.on("SCB",(action,user)=>{
            CBs[user[2]-1].checked = action=="C"?true:false;
            action == "C"?alertify.success(`${user[0]} ${user[1]} skończył/a zadanie na stanowsku nr. ${user[2]}`):false;
            action == "C"?Trs[user[2]].classList.value = "table-success":Trs[user[2]].classList.value = "table-info";
        });
        socket.on("UUpdate",(user)=>{
            Trs[user[2]].children[1].innerText = user[0];
            Trs[user[2]].children[2].innerText = user[1];
            Trs[user[2]].classList.value = "table-info";
            alertify.success(`${user[0]} ${user[1]} dołączył/a na ${user[2]} stanowisku`);
        });
    }else{
        let D = document.querySelector("#student");
        D.style.display = "flex";
        let CB = document.querySelector("#CB");
        D.children[0].innerText = User[0][2];
        D.children[1].innerText = User[0][0];
        D.children[2].innerText = User[0][1];
        CB.addEventListener("click",()=>{
            if(CB.checked == true){
                socket.emit("CB",User[0],"C");
            }else{
                socket.emit("CB",User[0],"U");
            }
        })
    }
});

function build(){
    let tab = [`<thead><tr><th scope="col">#</th><th scope="col">Imię</th><th scope="col">Nazwisko</th><th scope="col">Zadanie</th></tr></thead><tbody>`];
    for(let i = 1 ; i<=19; i++){
        tab[i] = `<tr"><td scope="row">${i}</td><td></td><td></td><td><input type="checkbox" name="CB" class="CB"  disabled><td></tr>`
    }

    return tab.join("")+"</tbody>";
};