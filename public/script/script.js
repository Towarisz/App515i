let fields = document.querySelectorAll(".input");
const socket = io();
const User = {}

// logowanie
document.querySelector("#submit").addEventListener("click",()=>{
    if(fields[2].value != 20){ // logowanie ucznia
        if(fields[0].checkValidity() && fields[1].checkValidity() && !fields[2].validity.valueMissing && !fields[2].validity.rangeOverflow && !fields[2].validity.rangeUnderflow){
            socket.emit("login",[...fields].map(el=>el.value));
            User[0] = [...fields].map(el=>el.value);
            socket.emit("Student");
        }else{
            alertify.error('Proszę wypełnić wszystkie pola');
        }
    }else{ // logowanie nauczyciela
        alertify.prompt("Logowanie","Proszę podać hasło: ","",(evt,value)=>{
            socket.emit("login",["Teacher","Teacher",20]);
            socket.emit("Teacher",value);
        },function(){});
    }
});
//koniec logowania

// ktos jest juz zalogoany pod danym id
socket.on('LoginOccupied', (msg) => {
    alertify.error(msg);
  });
// koniec

// blede haslo
socket.on('DenyAccess', () => {
    alertify.error('Błędne Hasło');
});
// koniec

// udane logowanie
socket.on('Passed',(msg)=>{
    alertify.success(`Zalogowano się jako ${msg}`);
    document.querySelector("#login").style.display = "none";
    if(msg == 'Nauczyciel'){ //udane logowanie nauczyciela
       
        window.document.title = "Panel Nauczyciela";
        document.querySelector("#teacher").innerHTML = `${build().toString()}`;
        document.querySelector("#student").innerHTML = ``;
        let Trs = document.querySelectorAll("tr");
        //funkcjonalnosc buttona timeBtn
        const timeBtn = document.querySelector("#timeBtn");
        let timer;
        let time=0;
        const timeDisplay = document.querySelector("#timeDisplay")
        timeBtn.classList.add("btn","btn-outline-info");
        let timeStarted = false; //zmienna przetrzymujaca informacje czy czas sie juz zanczal
        timeBtn.addEventListener("click",()=>{ //zegar
            if(timeStarted){
                timeBtn.innerText = "Start";
                window.clearInterval(timer)
            }else{
                time = 0;
                timer = setInterval(() => {
                    time+=1;
                    timeSec = time%60>59?0:time%60;
                    timeSec = timeSec<10?"0"+timeSec:timeSec;
                    timeMin = time>=60?~~(time/60):0;
                    timeMin = timeMin<10?"0"+timeMin:time;
                    timeDisplay.innerText = ` ${timeMin}:${timeSec}`;
                }, 1000);
                timeBtn.innerText = "Stop";
            }
            timeStarted = !timeStarted;
        })

        //funkcjonalnosc reqCode
        let cbReqCode = document.querySelector("#reqCode");
        cbReqCode.addEventListener("click",()=>{
            cbReqCode.checked?socket.emit("reqCode",true):socket.emit("reqCode",false);
        })

        socket.on("Data",(Users)=>{
            Object.values(Users).forEach(x=>{
                let data = x.value[2];
                if(data != 20){
                    Trs[data].children[1].innerText = x.value[0];
                    Trs[data].children[2].innerText = x.value[1];
                    Trs[data].classList.value = "table-info";
                }
            });
        });
        socket.on("SCB",(action,user)=>{ //zaznaczenie/odznaczenie cb 
            action == "C"?alertify.success(`${user[0]} ${user[1]} skończył/a zadanie na stanowsku nr. ${user[2]}`):false;
            action == "C"?Trs[user[2]].classList.value = "table-success":Trs[user[2]].classList.value = "table-info";
            action == "C"?Trs[user[2]].lastElementChild.innerText=timeDisplay.innerText:false;
        });

        socket.on("UUpdate",(user)=>{ // wyswietlenie dolaczenia ucznia
            Trs[user[2]].children[1].innerText = user[0];
            Trs[user[2]].children[2].innerText = user[1];
            Trs[user[2]].classList.value = "table-info";
            alertify.success(`${user[0]} ${user[1]} dołączył/a na ${user[2]} stanowisku`);
        });
        socket.on("DC",(user)=>{ // wyswietlenie rozloczenia ucznia
            alertify.message(`${user[0]} ${user[1]} rozłączył/a się ze stanowskia nr. ${user[2]}`);
            Trs[user[2]].classList.value = "";
            Trs[user[2]].children[1].innerText = ""; 
            Trs[user[2]].children[2].innerText = "";
            Trs[user[2]].children[3].innerHTML = "";
            Trs[user[2]].children[4].innerHTML = "";
        });
        socket.on("fProblem",(id,quest,qcode)=>{ // wyswietlenie problemu / pytania ucznia
            Trs[id].classList.value = "table-danger"
            let btn = document.createElement("button")
            btn.classList.add("btn","btn-outline-info")
            btn.innerText = "Help"
            btn.addEventListener("click",()=>{
                alertify.helpAlert(quest,qcode,id);
            })
            Trs[id].children[3].innerHTML="";
            Trs[id].children[3].appendChild(btn)
        })

        socket.on("code",(id,code)=>{
            let btn = document.createElement("button")
            btn.classList.add("btn","btn-outline-info")
            btn.innerText = "Kod"
            btn.addEventListener("click",()=>{
                alertify.viewCode(code,id);
            })
            Trs[id].children[3].innerHTML="";
            Trs[id].children[3].appendChild(btn)
        })

        //koniec udanego logowania nauczyciela
    }else{ //udane logowanie ucznia
        //generowanie wygladu
        let isCodeRequired = false;
        window.document.title = "Panel Ucznia";
        let D = document.querySelector("#student > div.userID");
        D.parentElement.style.display = "flex";
        let CB = document.querySelector("#CB");
        let help = document.querySelector("#help");
        D.innerHTML = `<span class="badge bg-dark">${User[0][2]}</span><span style="margin-left:10px;"> ${User[0][0]} ${User[0][1]}</span>`;
        
        // wyslanie zapytania o pomoc
        help.addEventListener("click",()=>{
            alertify.myAlert("");
        });

        // wyslanie wartoci cb
        CB.addEventListener("click",()=>{
            if(CB.checked == true){
                if(isCodeRequired){
                    alertify.sendCode("")
                }else{
                    socket.emit("CB",User[0],"C");
                }
            }else{
                socket.emit("CB",User[0],"U");
            }
        })
        //reset cb kiedy loguje sie nauczyciel 
        socket.on("CBReset",()=>{
            CB.checked = false;
        });
        socket.on("reqCode",(isReq)=>{
            isCodeRequired = isReq;
        })
    }//koniec udanego logowania ucznia
});//koniec udanego logowania

function build(Users){//stworzenie tabeli uczniow dla widoku nauczyciela 
    let tab = [`<thead><tr><th scope="col">#</th><th scope="col">Imię</th><th scope="col">Nazwisko</th><th scope="col">Zadanie <input type="checkbox" id="reqCode" class="form-check-input"></th><th><button id="timeBtn">Start</button><span id="timeDisplay"> 00:00<span></th></tr></thead><tbody>`];
    for(let i = 1 ; i<=19; i++){
        tab[i] = `<tr><td scope="row">${i}</td><td></td><td></td><td></td><td></td></tr>`
    }

    return tab.join("")+"</tbody>";
};