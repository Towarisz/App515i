let fields = document.querySelectorAll(".input");
const socket = io();
const User = {}

// klasy alertify
alertify.dialog('myAlert',function factory(){//wyslanie pytania do nauczyciela
    return{
      main:function(){
            this.message = 
            "Pytanie <br> <textarea id='Question' style='width: 100%;overflow-wrap: break-word;resize: none;'></textarea> <br><br> Kod <br> <textarea id='Qcode' style=' width: 100%;overflow-wrap: break-word;resize: none;' rows='6'></textarea>";
      },
      build:function(){
          this.setHeader("Pomoc");
        },
        setup:function(){
            return { 
                buttons:[{text:"Potwierdź"},{text: "Anuluj", key:27, cancel:true}],
                focus: { element:0 },
                options:{
                  maximizable:false,
                  movable:false,
                  closable:false,
                },
            };
      },
      prepare:function(){
        this.setContent(this.message);
        this.resizeTo(500,480);
      },
      callback:function(CloseEvent){
        if(CloseEvent.button.cancel != true){
            
            let quest = this.elements.content.children[1].value;
            let qcode = this.elements.content.lastElementChild.value;
            let id = User[0][2];
            console.log(quest,qcode,id);
            socket.emit("Problem",id,quest,qcode);
        }
      }
  }});

  alertify.dialog('helpAlert',function factory(){//odzczytanie wiadomosci od ucznia
    return{
      main:function(quest,qcode,id){
        this.message = `<p>pytanie:<br><pre><code>${quest}</code></pre></p></p>kod:<br><pre><code>${qcode}</code></pre></p>`;
        this.id = id
      },
      build:function(){
          this.setHeader("Pomoc");
        },
        setup:function(){
            return { 
                buttons:[{text:"Problem rozwiazany"},{text: "Anuluj", key:27, cancel:true}],
                focus: { element:0 },
                options:{
                  maximizable:false,
                  movable:false,
                  closable:false,
                },
            };
      },
      prepare:function(){
        this.setContent(this.message);
        this.resizeTo(500,480);
      },
      callback:function(CloseEvent){
        if(CloseEvent.button.cancel != true){
            let tr = document.querySelectorAll("tr")[this.id]
            tr.classList.value = "table-info";
            tr.children[3].innerHTML="";
        }
      }
  }});
// koniec klas alertyify

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
        let CBs = document.querySelectorAll(".CB");
        let Trs = document.querySelectorAll("tr");
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
        });

        socket.on("UUpdate",(user)=>{ // wyswietlenie dolaczenia ucznia
            Trs[user[2]].children[1].innerText = user[0];
            Trs[user[2]].children[2].innerText = user[1];
            Trs[user[2]].classList.value = "table-info";
            CBs[user[2]].checked = false;
            alertify.success(`${user[0]} ${user[1]} dołączył/a na ${user[2]} stanowisku`);
        });
        socket.on("DC",(user)=>{ // wyswietlenie rozloczenia ucznia
            alertify.message(`${user[0]} ${user[1]} rozłączył/a się ze stanowskia nr. ${user[2]}`);
            Trs[user[2]].classList.value = "";
            Trs[user[2]].children[1].innerText = ""; 
            Trs[user[2]].children[2].innerText = "";
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

        //koniec udanego logowania nauczyciela
    }else{ //udane logowanie ucznia
        //generowanie wygladu
        let D = document.querySelector("#student > div.userID");
        D.parentElement.style.display = "flex";
        let CB = document.querySelector("#CB");
        let help = document.querySelector("#help");
        D.innerHTML = `<span class="badge bg-dark">${User[0][2]}</span><span> ${User[0][0]} ${User[0][1]}</span>`;
        
        // wyslanie zapytania o pomoc
        help.addEventListener("click",()=>{
            alertify.myAlert("");
        });

        // wyslanie wartoci cb
        CB.addEventListener("click",()=>{
            if(CB.checked == true){
                socket.emit("CB",User[0],"C");
            }else{
                socket.emit("CB",User[0],"U");
            }
        })
        //reset cb kiedy loguje sie nauczyciel 
        socket.on("CBReset",()=>{
            CB.checked = false;
        });
    }//koniec udanego logowania ucznia
});//koniec udanego logowania

function build(Users){//stworzenie tabeli uczniow dla widoku nauczyciela 
    let tab = [`<thead><tr><th scope="col">#</th><th scope="col">Imię</th><th scope="col">Nazwisko</th><th scope="col">Zadanie</th></tr></thead><tbody>`];
    for(let i = 1 ; i<=19; i++){
        tab[i] = `<tr><td scope="row">${i}</td><td></td><td></td><td></td></tr>`
    }

    return tab.join("")+"</tbody>";
};