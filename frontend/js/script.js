function goBackToEmail() {
    document.getElementById('otp-section').classList.add('hidden');
    document.getElementById('email-section').classList.remove('hidden');
    document.getElementById('email-input').focus();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.querySelectorAll('.otp-input').forEach((input, index) => {
    input.addEventListener('input', function(e) {
        if (e.target.value.length === 1 && index < 5) {
            document.querySelectorAll('.otp-input')[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            document.querySelectorAll('.otp-input')[index - 1].focus();
        }
    });
});

    const sendOTP=document.getElementById("send-otp-btn");
    const verifyOTP=document.getElementById("verify-otp-btn");
    

    sendOTP.addEventListener("click", async ()=>{
        console.log("Send OTP button clicked"); 
        //send mail.trim().lowercase() value to backend on post route to store mail and generated otp in session and send otp to given mail
        const email = document.getElementById('email-input').value.trim().toLowerCase();
          if (!email || !isValidEmail(email)) {
             alert('Please enter a valid email address');
           return;
        }

        console.log("Email:", email);
    
    document.getElementById('email-display').textContent = email;
    document.getElementById('email-section').classList.add('hidden');
    document.getElementById('otp-section').classList.remove('hidden');
    
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs[0].focus();

    //sending mail to sever api
     const response= await fetch("/send-otp",{

        method:"POST",
        credentials: "same-origin",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email
        })

     });

     //extracting response to check what server sends to client
     const data= await response.text();
     
    });

    verifyOTP.addEventListener("click", async ()=>{

          //here we will look for typed otp
            const otpInputs = document.querySelectorAll('.otp-input');
           const otp = Array.from(otpInputs).map(input => input.value).join('');
    
        if (otp.length !== 6) {
         alert('Please enter the complete 6-digit code');
         return;
        } 

        //disabling btn once clicked
        verifyOTP.disabled=true;
        verifyOTP.textContent="Verifying.";

        //removing current color of the btn
        verifyOTP.classList.remove(
        "bg-gradient-to-r",
        "from-primary",
        "to-indigo-600"
        );

        //adding gray bg
        verifyOTP.classList.add("bg-gray-400");
        
        //now we will take this otp and send it to verify otp post route to verify the otp from the session and check for it
        const response= await fetch("/verify-otp",{
            method:"POST",
            credentials: "same-origin",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                user_otp:otp
            })
        });

        const data=await response.text();

        //restoring button if response is not okay
        if(response.ok){
            alert(data);
            window.location.href="/";
        }else {
    alert(data);

    verifyOTP.disabled = false;
    verifyOTP.textContent = "Verify & Sign In";

    verifyOTP.classList.remove("bg-gray-400");

    verifyOTP.classList.add(
        "bg-gradient-to-r",
        "from-primary",
        "to-indigo-600"
    );
}
    });