import{
    auth, database,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    dbRef,
    set,
    get
} from "./firebase.js"

// Login 
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
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

// Dashboard header container
const profileName = document.getElementById('profile-info-title');
const profileEmail = document.getElementById('profile-info-email');
const profileIcon = document.getElementById('profile-photo');

// Profile icon
let baseImageLink = "";

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
            
            // Convert the image into Base64
            baseImageLink = e.target.result;
            
            // Preview on the image
            document.getElementById('profile-preview').innerHTML = `<img src="${e.target.result}" 
                                    alt="Profile Preview" style="width:100%; height:100%; 
                                    border-radius:50%; object-fit:cover;">`;
            };
            reader.readAsDataURL(file);
        }
});

// // Toggle password visibility
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

document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const inputId = btn.dataset.id;
        togglePassword(inputId);
    })
})

// Login section
loginBtn.addEventListener('click', async function() {
    console.log('Login process started');

    const email = emailInput.value;
    const password = passwordInput.value;

    if(!email || !password){
        console.log('Missing fields');
        showError('Please fill all the fields');
        return;
    }

    if(!email.includes('@')){
        console.log('Enter valid Email');
        showError('Please Enter valid Email');
        return;
    }

    try {
        // Login with firebase 
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from firebase database
        const userReference = dbRef(database, user.uid + '/users/' );
        const snapshot = await get(userReference);

        if(snapshot.exists()){
            const userData = snapshot.val();
            console.log(userData);

            // save data to local Storage
            localStorage.setItem('userLoggedIn', true);
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('userName', userData.username);
            localStorage.setItem('userEmail', userData.userEmail);
            localStorage.setItem('userProfile', userData.avatar);
            
            // Show dashboard with user data
            profileName.textContent = userData.username;
            profileEmail.textContent = userData.userEmail;
            profileIcon.src = userData.avatar;
            
            // Hide and show items
            document.querySelector('.auth-card').style.display = 'none';
            document.querySelector('.footer').style.display = 'none';
            document.getElementById('dash-container').style.display = 'block';
        }
        else {
            showError('User data not found');
        }
    }
    catch(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.log(errorMessage);
        showError('Login failed:' +error.message);    
    }                                                                                                           
});

// Register section
createAccountBtn.addEventListener('click', function() {

    console.log('Registration process started');
    const regName = regNameInput.value;
    const regEmail = regEmailInput.value;
    const regPassword = regPasswordInput.value;
    const regConfirm = regConfirmPassword.value;
    const avatar = pictureUpload.files[0];

    // input validations
    if(!regName || !regEmail || !regPassword || !regConfirm){
        console.log('Missing fields');
        showError('Please fill all the fields');
        return;
    }

    if(regName.length < 4 || regName.length > 15){
        showError('User Name must be valid length min: 4 max: 15');
        return;
    }

    if(!regEmail.includes('@')){
        console.log('Invalid Email');
        showError('Invalid Email');
        return;
    }

    if(regPassword.length < 6){
        showError('Password must be atleast 6 characters');
        return;
    }

    if(regPassword !== regConfirm){
        showError('Passwords do not match');
        return;
    }

    // check user uploaded a profile picture
    let profileAvatarLink = baseImageLink;
    if(avatar){
        console.log('Created with profile avatar');
        
        const reader = new FileReader();
        reader.onload = function(e){
 
            profileAvatarLink = e.target.result;
            // function call to create user
            createUserAccount(profileAvatarLink);
        };
        reader.readAsDataURL(avatar);
    }
    else{
        console.log('Created without profile avatar');
        createUserAccount(profileAvatarLink);
    }
    
    // firebase user creation activities
    async function createUserAccount(avatarLink){
        try{
            let databaseStored;
            // Create Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
            const user = userCredential.user;

            // Store in firebase realtime database
            databaseStored = await storedUserData(user, avatarLink);

            // Save data in local storage for later use
            storeLocalData(user, avatarLink);

            if(databaseStored){
                showSuccess('Account created successfully!');
            }
            else{
                showSuccess('Account created! Please complete your profile setup.');
            }

            // Show Dashboard
            setTimeout(() => showDashboard(), 1500);
        }
        catch(error){
            showError(error.message);
            console.Error(error.Code);
            console.Error(error.message);
        }
    }

    // Store user data in firebase
    async function storedUserData(user, avatarLink){
        try{
            await set(dbRef(database, `${user.uid}/users/`), {
                uid: user.uid,
                username: regName,
                userEmail: regEmail,
                avatar: avatarLink,
                createdAt: new Date().toISOString()
            });
            // return value boolean used to check later
            return true;
        }
        catch(error){
            console.warn('Firebase storage failed:', error);
            return false;
        }
    }

    // Store user data in Local Database
    function storeLocalData(user, avatarLink){
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', regEmail);
        localStorage.setItem('userName', regName);
        localStorage.setItem('userProfile', avatarLink);
        localStorage.setItem('userId', user.uid);
    }

})
    
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

googleBtn.addEventListener('click', function() {
    showSuccess('Redirecting to Google authentication...');
     setTimeout(() => {
        showDashboard();
     }, 1000);
});
     
function showDashboard(){
    document.querySelector('header').style.display = 'none';
    document.querySelector('.auth-card').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.getElementById('dash-container').classList.add('active');
    document.getElementById('dash-container').style.display = 'block';
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

// Attendance selection 
let selectedAttendance = null;
document.querySelectorAll('.attendance-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        document.querySelectorAll('.attendance-option').forEach(opt => {
            opt.classList.remove('selected');
        }) ;

        // Select for current
        this.classList.add('selected');
        selectedAttendance = this.getAttribute('data-value');
    });
});

// after submitting the result value display to the summary
// document.getElementById('result-attendance').textContent = 
// selectedAttendance ? selectedAttendance.charAt(0).toUpperCase() + 
// selectedAttendance.slice(1) : '--';

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

// Check userLogin
// window.onload = function(){
//     // check if user was logged in
//     if(this.localStorage)
// }


