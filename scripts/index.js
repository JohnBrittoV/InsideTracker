// Login 
const emailInput = document.getElementById('login-email');
const password = document.getElementById('login-password');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const gitBtn = document.getElementById('gitBtn');

// Register
const pictureUpload = document.getElementById('profile-picture');
const regNameInput = document.getElementById('register-name');
const regEmailInput = document.getElementById('register-email');
const regPasswordInput = document.getElementById('register-password');
const regConfirmPassword = document.getElementById('register-confirm-password');
const createAccountBtn = document.getElementById('createAccountBtn');
const registerGoogleBtn = document.getElementById('regGoogleBtn');
const registerGitBtn = document.getElementById('regGitBtn');

// login - Register tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function(){
        // Remove active class
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.remove('active');
        });

        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        document.getElementById(`${tabId}-form`).classList.add('active');

        hideError();
        hideSuccess();
    });
});

// Profile picture upload
pictureUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-preview').innerHTML = `<img src="${e.target.result}" 
                                    alt="Profile Preview" style="width:100%; height:100%; 
                                    border-radius:50%; object-fit:cover;">`;
            };
            reader.readAsDataURL(file);
        }
});

// Toggle password visibility
function togglePassword(inputId){
    const input = document.getElementById(inputId);
    const toogle = input.parentNode.querySelector('.password-toggle i');

    if(input.type === 'password'){
        input.type = 'text';
        toogle.className = 'fas fa-eye-slash';
    }
    else{
        input.type = 'password';
        toogle.className = 'fas fa-eye';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
    hideSuccess();
}

// Hide error message
function hideError() {
    document.getElementById('error-message').classList.remove('active');
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.classList.add('active');
    hideError();
}

// Hide success message
function hideSuccess() {
    document.getElementById('success-message').classList.remove('active');
}

function googleAuth(){
     showSuccess('Redirecting to Google authentication...');

     setTimeout(() => {
        showDashboard();
     }, 1500);
}

function showDashboard(){
    document.querySelector('header').style.display = 'none';
    document.querySelector('.auth-card').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.getElementById('dash-container').classList.add('active');
    document.getElementById('dash-container').style.display = 'block';
}

// Login section
function login(){
    console.log("Generated");
}

// Dashboard Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });

        //Add active class to clicked item
        this.classList.add('active') ;
        const pageId = this.getAttribute('data-page');

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
    });

     // show current page selected
        document.getElementById(pageId).classList.add('active');
    });
});

// Time validation and display
document.querySelectorAll('#focus-time, #code-time, #active-time').forEach(input => {
    
    input.addEventListener('input', function() {
        
        // get the id and replace the -time with display 
        // means focus-time turned to focus-display 

        const displayId = this.id.replace('-time', '-display');
        const display = document.getElementById(displayId);
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

        if(this.value === ''){
            display.textContent = '--:--:--';
            display.classList.remove('valid', 'invalid');
        }
        else if(timeRegex.test(this.value)){
            display.textContent = this.value;
            console.log(this.value);
            display.classList.remove('invalid');
            display.classList.add('valid');
        }
        else{
            display.textContent = 'Invalid format';
            display.classList.remove('valid');
            display.classList.add('invalid');
        }
    });
});
