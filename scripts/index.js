
// Tab switching
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
document.getElementById('profile-picture').addEventListener('change', function(e) {
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
    document.querySelector('.auth-card').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
}