alertify.dialog('myAlert',function factory(){//wyslanie pytania do nauczyciela
    return{
      main:function(){
            this.message = 
            `Pytanie <br>
            <textarea id='Question' style='width: 100%;overflow-wrap: break-word;resize: none;'></textarea><br><br>
            Kod <br>
            <textarea id='Qcode' style=' width: 100%;overflow-wrap: break-word;resize: none;' rows='6'></textarea>`;
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
        this.message = 
        `<p>
        pytanie:<br>
        <pre><code>${quest}</code></pre>
        </p>
        <p>
        kod:<br>
        <textarea style='width: 100%;overflow-wrap: break-word;resize: vertical;'>${qcode}</textarea>
        </p>`;
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

alertify.dialog('sendCode',function factory(){//wyslanie kodu po zakonczenu zadania do nauczyciela
    return{
      main:function(){
            this.message = 
           `Kod <br>
            <textarea id='Qcode' style=' width: 100%;overflow-wrap: break-word;resize: none;' rows='10'></textarea>`;
      },
      build:function(){
          this.setHeader("Kod");
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
            let code = this.elements.content.lastElementChild.value;
            let id = User[0][2];
            console.log(code,id);
            socket.emit("CB",User[0],"C");
            socket.emit("code",id,code);
            
        }
      }
  }});

  alertify.dialog('viewCode',function factory(){//wyslanie pytania do nauczyciela
    return{
        main:function(code,id){
          this.message = 
          `
          kod:<br>
          <textarea style='width: 100%;overflow-wrap: break-word;resize: vertical;'>${code}</textarea>
          </p>`;
          this.id = id
        },
        build:function(){
            this.setHeader("Kod");
          },
          setup:function(){
              return { 
                  buttons:[{text:"Ok"},{text: "Anuluj", key:27, cancel:true}],
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
              
          }
        }
    }});
