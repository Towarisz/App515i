let fields = document.querySelectorAll("input");
const socket = io();

document.querySelector("#submit").addEventListener("click",()=>{
    if(fields[0].checkValidity() && fields[1].checkValidity() && !fields[2].validity.valueMissing && fields[2].validity.rangeOverflow && fields[2].validity.UnderOverflow){
        socket.emit("login",[...fields].map(el=>el.value));
    }else{
        alertify.error('Proszę wypełnić wszystkie pola');
    }
});

socket.on('LoginOccupied', function(msg) {
    alertify.error(msg);
  });