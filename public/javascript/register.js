import FormValidation from '/javascript/FormValidation.js';

// const emailInput = document.getElementById('email');
// const emailError = document.getElementById('emailError');

const nameInput = document.getElementById('name');
const nameError = document.getElementById('nameError');

const passwordInput = document.getElementById('password');
const passwordError = document.getElementById('passwordError');

const confirmationInput = document.getElementById('confirmation');
const confirmationError = document.getElementById('confirmationError');

const button = document.getElementById('registerButton');

let nameReady = false;
// let emailReady = false;
let passwordReady = false;
// let formState = false;

nameInput.addEventListener('blur', () => {
    nameReady = FormValidation.validateEmptyInput(nameInput, nameError, 'name field cannot be left empty');
    // formState = nameReady && emailReady && passwordReady;
    // FormValidation.activeButton(button, formState); 
});

// emailInput.addEventListener('blur', () => {
//     emailReady = FormValidation.validateEmail(emailInput, emailError);
//     formState = nameReady && emailReady && passwordReady;
//     FormValidation.activeButton(button, formState); 
// });



passwordInput.addEventListener('blur', () => {
    FormValidation.validateEmptyInput(passwordInput, passwordError, 'password field cannot be left empty');
    // formState = nameReady && emailReady && passwordReady;
    // FormValidation.activeButton(button, formState); 
});

confirmationInput.addEventListener('blur', () => {
    passwordReady = FormValidation.validateConfirmation(passwordInput, confirmationInput, confirmationError);
    // formState = nameReady && emailReady && passwordReady;
    // FormValidation.activeButton(button, formState); 
});










