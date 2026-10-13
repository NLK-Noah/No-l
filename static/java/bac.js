function tirerLettre() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
  }
  
  
 const lettre = "C";
 document.getElementById('lettre').innerHTML=lettre;