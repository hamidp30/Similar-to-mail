document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  load_mailbox('inbox');
});
// HamidrezEbrahimi
function compose_email() {

  document.getElementById('title').textContent="New Email";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('form').onsubmit = function() {
    fetch('/emails',{
      method: 'POST',
      body: JSON.stringify ({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
        })        
    })
    .then(response => response.json())
    .then(result => {
      if(result.error){
        alert(result.error);
      }else if(result.message){
        alert(result.message);
        load_mailbox('sent');
      }
    });
    return false;
  }


}

function load_mailbox(mailbox) {
  
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch('/emails/'+ mailbox)
    .then(response => response.json())
    .then(data => {
      for(let i=0; i < data.length; i++){
        let objvlu = Object(data[i])
        let div = document.createElement("div");
        div.className = "item";
        div.addEventListener("click", function() {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#email-view').style.display = 'block';
          document.querySelector('#compose-view').style.display = 'none';

          fetch('/emails/'+ objvlu.id,{method:'PUT',body: JSON.stringify({read: true})});

          fetch('/emails/'+ objvlu.id)
          .then(response => response.json())
          .then(data => {
            let emailView = document.querySelector('#email-view');
            if (mailbox == "sent" ){
              emailView.innerHTML = `<div class="emailinfo">
                <div>From: ${objvlu.sender}</div>
                <div>To: ${objvlu.recipients}</div>
                <div>Subject: ${objvlu.subject}</div>
                <div>Timestamp: ${objvlu.timestamp}</div>
                </div><hr>
                <div class="email-content">${objvlu.body}</div>`;
            }else if(mailbox == "inbox" ){
              emailView.innerHTML = `<div class="emailinfo">
                <div>From: ${objvlu.sender}</div>
                <div>To: ${objvlu.recipients}</div>
                <div>Subject: ${objvlu.subject}</div>
                <div>Timestamp: ${objvlu.timestamp}</div>
                <button class="btn btn-sm btn-outline-primary" id="Reply" onclick="reply(${objvlu.id})">Reply</button>
                <button class="btn btn-sm btn-outline-primary" id="archived" onclick="archived(${objvlu.id})">★</button>
                </div><hr>
                <div class="email-content">${objvlu.body}</div>`;
            }else{
              emailView.innerHTML = `<div class="emailinfo">
                <div>From: ${objvlu.sender}</div>
                <div>To: ${objvlu.recipients}</div>
                <div>Subject: ${objvlu.subject}</div>
                <div>Timestamp: ${objvlu.timestamp}</div>
                <button class="btn btn-sm btn-outline-primary" id="Reply" onclick="reply(${objvlu.id})">Reply</button>
                <button class="btn btn-sm btn-outline-primary" id="unarchived" onclick="unarchived(${objvlu.id})">UnArchived</button>
                </div><hr>
                <div class="email-content">${objvlu.body}</div>`;
            }
          })

        });

        let sender = document.createElement("div");
        sender.className = "Object-sender";
        sender.innerHTML = "<b>" + objvlu.sender + "</b>";
        div.appendChild(sender);

        let subject = document.createElement("div");
        subject.className = "Object-subject";
        subject.innerHTML = objvlu.subject;
        div.appendChild(subject);

        let timestamp = document.createElement("div");
        timestamp.className = "Object-timestamp";
        timestamp.innerHTML = objvlu.timestamp;
        div.appendChild(timestamp);
        
        let emailsView = document.getElementById("emails-view");
        emailsView.appendChild(div);
        if(objvlu.read == true && mailbox == "inbox"){
          div.style.background = "gray";
         }
        else{
          div.style.background = "with";
        }
      }
    })
}

function reply(id){
  document.getElementById('title').textContent="Reply Email";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
    fetch('/emails/'+ id)
      .then(response => response.json())
      .then(result => {
       console.log(result);
       document.querySelector('#compose-recipients').value = result.sender;
       document.querySelector('#compose-recipients').disabled = true;
       const test = result.subject;
       if (test.includes('Re:')) { 
        document.querySelector('#compose-subject').value = result.subject;
       }else{
        document.querySelector('#compose-subject').value = 'Re:'+ result.subject;
       }
       document.querySelector('#compose-subject').disabled = true;
       document.querySelector('#compose-body').value = `On ${result.timestamp} ${result.sender} wrote: ${result.body}`;
      });
    
      document.querySelector('form').onsubmit = function() {
        fetch('/emails',{
          method: 'POST',
          body: JSON.stringify ({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
            })        
        })
        .then(response => response.json())
        .then(result => {
          if(result.error){
            alert(result.error);
          }else if(result.message){
            alert(result.message);
            load_mailbox('sent');
          }
        });
    return false;
      }
  }

  function archived(id){
    console.log(id);
     fetch('/emails/'+ id,{
        method: 'PUT',
        body: JSON.stringify({
          archived: true
          }) 
      })
      alert("Saved in the archive")
      load_mailbox('inbox')
    }

    function unarchived(id){
      fetch('/emails/'+ id,{
        method: 'PUT',
        body: JSON.stringify({
          archived: false
          }) 
      }) 
      alert("Removed from the archive")
      load_mailbox('inbox')       
      }