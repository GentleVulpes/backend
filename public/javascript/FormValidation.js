class FormValidation {

    static validateEmptyInput(input, errorElement, errorText) {
        if(input.value === '') {
            errorElement.classList.remove('hidden');
            errorElement.innerHTML = errorText;
            return false;
        }
        errorElement.classList.add('hidden');
        return true;
    }

    static validateEmail(input, errorElement) {
        console.log('estou validando o email');

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if(input.value === ''){
            errorElement.innerHTML = 'email adress cannot be empty';
            errorElement.classList.remove('hidden');
            return false;
        }

        if(!regex.test(input.value)){
            errorElement.innerHTML = 'invalid email adress';
            errorElement.classList.remove('hidden');
            return false;
        }

        errorElement.classList.add('hidden');
        return true;
    }

    static validateConfirmation (passwordInput, confirmationInput, errorElement) {
        if(confirmationInput.value === '') {
            errorElement.classList.remove('hidden');
            errorElement.innerHTML = 'confirmation field cannot be left empty';
            return false;
        }
        if(passwordInput.value !== confirmationInput.value) {
            errorElement.classList.remove('hidden');
            errorElement.innerHTML = 'confirmation field dont match password field';
            return false;
        }
        errorElement.classList.add('hidden');
        return true;
    }

    static validateLogin() {
        const name = document.getElementById('name');
        const nameError = document.getElementById('nameError');
        const password = document.getElementById('password');
        const passwordError = document.getElementById('passwordError');

        this.validateEmpty(name, nameError);
        this.validateEmpty(password, passwordError);
    }

    static activeButton(button, readyState) {
        if(!readyState) {
            button.disabled = true;
            return;
        }
        button.disabled  = false;
        return;
    }

}

export default FormValidation;