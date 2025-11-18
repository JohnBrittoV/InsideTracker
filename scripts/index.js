import{
    auth, database,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    onAuthStateChanged,
    signOut,
    dbRef,
    set,
    get,
    onValue,
    onDisconnect,
    serverTimestamp
} from "./firebase.js"

// Login 
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const gitBtn = document.getElementById('gitBtn');

// Register
const pictureUpload = document.getElementById('profile-picture');
const profileView = document.getElementById('profile-preview');
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
const logoutButton = document.getElementById('logoutBtn');

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

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    hideError();

    if(!email || !password){
        console.log('Missing fields');
        showError('Please fill all the fields');

        // Highlight empty fields
        if(!email) emailInput.classList.add('field-error');
        if(!password) passwordInput.classList.add('field-error');
        return;
    }

    if(!email.includes('@')){
        console.log('Enter valid Email');
        showError('Please Enter valid Email');
        emailInput.classList.add('field-error');
        return;
    }

    console.log(email);
    //
    console.log('All login validations Passed');
    showLoading('Sigining you in...', 'dots');

    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        console.log(auth);

        if(methods.length === 0){
            hideLoading();
            return showError('No account found. Create a new account');
        }
        
        // Login with firebase 
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        updateLoadingMessage('Verifying your account...');
        
        // Get user data from firebase database
        const userReference = dbRef(database, `Users/${user.uid}/Profile`);
        const snapshot = await get(userReference);

        if(!snapshot.exists()){
            hideLoading();
            return showError('User Profile not found. Please create Account');
        }
            const userData = snapshot.val();
            console.log(userData);
            updateLoadingMessage('Loading your dashboard...');

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
            
            updateLoadingMessage('Welcome back!');
            // Hide and show items
            clearLoginFields();
    }
    catch(error){
        hideLoading();
        const displayError = handleAuthError(error);    
        console.error('Login failed:' + error.code, error.message);
        showError(displayError);    
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

    // clear previous errors
    hideError();

    // input validations
    if(!regName || !regEmail || !regPassword || !regConfirm){
        console.log('Missing fields');
        showError('Please fill all the fields');

        // Highlight the fields
        if(!regName) regNameInput.classList.add('field-error');
        if(!regEmail) regEmailInput.classList.add('field-error');
        if(!regPassword) regPasswordInput.classList.add('field-error');
        if(!regConfirm) regConfirmPassword.classList.add('field-error');

        return;
    }

    if(regName.length < 4 || regName.length > 15){
        showError('User Name must be valid length min: 4 max: 15');
        regNameInput.classList.add('field-error');
        return;
    }

    if(!regEmail.includes('@')){
        console.log('Invalid Email');
        showError('Invalid Email');
        regEmailInput.classList.add('field-error');
        return;
    }

    if(regPassword.length < 6){
        showError('Password must be atleast 6 characters');
        regPasswordInput.classList.add('field-error');
        return;
    }

    if(regPassword !== regConfirm){
        showError('Passwords do not match');
        regPasswordInput.classList.add('field-error');
        regConfirmPassword.classList.add('field-error');
        return;
    }

    // check profile picture uploaded or not
    if(avatar){
        const maxSize = 200 * 1024;  
        
        // Check the image size larger than 200KB
        if(avatar.size > maxSize){
            alert('Image size should be less than 200KB');
            showError('Image size must be less than 200KB');
            return;
        }

        // Check file type for security
        const allowedFileType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if(!allowedFileType.includes(avatar.type)){
            showError('Please select a valid image (PNG, JPEG, GIF)');
            return;
        }
    }

    clearRegistrationFields();
    console.log('All Registration validation passed');
    showLoading('Creating your account...', 'spinner');

    let profileAvatarLink = baseImageLink;
    if(avatar){
        console.log('Processing user uploading Icon');
        const reader = new FileReader();
        reader.onload = function(e){
            profileAvatarLink = e.target.result;

            updateLoadingMessage('Processing profile picture');

            createUserAccount(profileAvatarLink);
        };
        reader.readAsDataURL(avatar);
    }
    else{
        console.log('No icon selected, using default user icon');
        profileAvatarLink = 'Images/user-person.png';
        createUserAccount(profileAvatarLink);
    }
    
    // firebase user creation activities
    async function createUserAccount(avatarLink){
        try{
            let databaseStored;
            updateLoadingMessage('Creating authentication..');

            // Create Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
            const user = userCredential.user;
            updateLoadingMessage('Saving your data..');

            // Store in firebase realtime database
            databaseStored = await storedUserData(user, avatarLink);

            // Save data in local storage for later use
            storeLocalData(user, avatarLink);

            // Hide loading when everything is successful
            hideLoading();

            if(databaseStored){
                showSuccess('Account created successfully! 🎉');
            }
            else{
                showSuccess('Account created! Please complete your profile setup.');
            }

            setTimeout(() => {
                hideLoading();
                setButtonLoading(createAccountBtn, false);
            } , 1500);
        }
        catch(error){
            hideLoading();
            const ErrorDisplayFunction = handleAuthError(error);
            showError(ErrorDisplayFunction);
            console.error(`Registraion error:`+ error.Code, error.message);
        }
    }

    // Store user data in firebase
    async function storedUserData(user, avatarLink){
        try{
            await set(dbRef(database, `Users/${user.uid}/Profile`), {
                uid: user.uid,
                username: regName,
                userEmail: regEmail,
                avatar: avatarLink,
                createdAt: new Date().toISOString()
            });
            // return value boolean used to check later
            console.log('Data stored in database');
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
        console.log('User data stored locally');
    }

})

    // Login form clear error highlights
    function clearLoginFields(){
        const fields = [emailInput, passwordInput];
            fields.forEach(items => {
            items.classList.remove('field-error');
        });
    }

    // Login form keyup remove error highlights when type new
    const loginFields = [emailInput, passwordInput];
    loginFields.forEach(pass => {
        pass.addEventListener('input', function(){
            this.classList.remove('field-error');
        });
    });

    // Registrartion form clear error highlights
    function clearRegistrationFields(){
    const fields = [regNameInput, regEmailInput, regPasswordInput, regConfirmPassword];
        fields.forEach(items => {
            items.classList.remove('field-error');
        });
    }

    // Registration form Keyup remove error highlights when type new
    const registerFields = [regNameInput, regEmailInput, regPasswordInput, regConfirmPassword];
    registerFields.forEach(item => {
        item.addEventListener('input', function(){
            this.classList.remove('field-error');
        });
    });

// Common error handling for register & login
function handleAuthError(error){
    if(error.code === 'auth/invalid-credential'){
        return 'Invalid credentials';
    }
    else if(error.code === 'auth/email-already-in-use'){
        return 'This email is already registered. Please try login.';
    }
    else if(error.code === 'auth/weak-password'){
        return 'Password should be at least 6 characters.';
    }
    else if(error.code === 'auth/invalid-email'){
        return 'Please enter a valid email address';
    }
    else if(error.code === 'auth/network-request-failed'){
        return 'No internet connection. Please check your network.';
    }
    else if(error.message.includes('Network Error') || error.message.includes('Failed to fetch')){
        return 'Network error. Please check your connection.';
    }
    else if(error.code == 'auth/too-many-requests'){
        return 'Too many attempts. Please try again later.';
    }
    else {
        return 'Something went wrong. Please try again.';
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

googleBtn.addEventListener('click', function() {
    showSuccess('Redirecting to Google authentication...');
     setTimeout(() => {
        showDashboard();
     }, 1000);
});
     
function showDashboard(){
    hideLoading();
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

function showLoading(message = 'Processing...', type = 'spinner'){
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loadingText');

    document.getElementById('spinnerLoader').style.display = 'none';
    document.getElementById('dotsLoader').style.display = 'none';
    text.textContent = message;

    if(type === 'spinner'){
        document.getElementById('spinnerLoader').style.display = 'block';
    }
    else if(type === 'dots'){
        document.getElementById('dotsLoader').style.display = 'flex';
    }
    overlay.classList.add('active');
}

function hideLoading(){
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('active');
}

function updateLoadingMessage(message){
    document.getElementById('loadingText').textContent = message;
}

function setButtonLoading(button, isLoading){
    if(isLoading){
        button.classList.add('btn-loading');
        button.disabled = true;
    }
    else {
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

function clearLocalStorage(){
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfile');
    console.log('Local storage cleared');
}

function clearAuthForms(){
    
    // clear login inputs
    emailInput.value = "";
    passwordInput.value = "";

    //clear register inputs
    regNameInput.value = "";
    regEmailInput.value = "";
    regPasswordInput.value = "";
    regConfirmPassword.value = "";

    //set Profile view to default icon
    profileView.innerHTML = '<i class="fas fa-user"></i>' ;
    
    hideError();
    hideSuccess();
}

function showHomePage(){
    //show homepage and hide dashboard
    document.querySelector('header').style.display = 'block';
    document.querySelector('.auth-card').style.display = 'block';
    document.querySelector('.footer').style.display = 'block';
    document.getElementById('dash-container').style.display = 'none';
}

logoutButton.addEventListener('click', () => {
    logout();
})

async function logout(){
    try{
        console.log('Logout process started');
        showLoading('Logging out...', 'dots');

        const userId = localStorage.getItem('userId');
        
        if(userId){
            const userReference = dbRef(database, `Users/${userId}/onlineStatus`);
            await set(userReference, {
                isOnline: 'offline',
                lastLogout: serverTimestamp()
            });
        }

        // Signout from firebase Auth
        await signOut(auth);

        clearLocalStorage();
        updateLoadingMessage('Logged out successfully!');
        clearAuthForms();

        setTimeout(() => {
            hideLoading();
        }, 1000);
    }
    catch(error){
        hideLoading();
        console.log('Logout error :', error);
        clearLocalStorage();
        window.location.href = '/';
    }
}

onAuthStateChanged(auth, async (user) => {
    if(user){
        console.log('User is logged in', user.uid);

        try{
            const profileRef = dbRef(database, `Users/${user.uid}/Profile`);
            const snapshot = await get(profileRef);

            if(snapshot.exists()){
                console.log('User profile found in database');

                // Extract profile data
                const data = snapshot.val();
                console.log('Profile data', data);

                profileName.textContent = data.username;
                profileEmail.textContent = data.userEmail;
                profileIcon.src = data.avatar;

                showDashboard();
            }
             else {
                console.log('No user logged in . Force logout activated!');
                await signOut(auth);
                showHomePage();                
            }
        }
        catch(error){
            console.log('error:', error);
            
        }
    }
    else {
        clearLocalStorage();
        showHomePage();
    }
});

