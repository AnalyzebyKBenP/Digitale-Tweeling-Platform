// This file cooperates with "contact.html" to make an email-submittable contact form
// This JS validates input
// Captcha validation and emailing the respons is handled in python (main.py)

var fields={};
form = document.getElementById('contactForm');

form.addEventListener('submit', (event) => {
    fields.name=document.getElementById('contact_name');
    fields.email=document.getElementById('contact_email');
    fields.opmerkingen=document.getElementById('contact_opmerkingen');

    if(isValid()) {
        console.log('Form valid')
    } else {
        console.log('Form invalid')
        // stop form submission
        event.preventDefault();
    }
});

function isNotEmpty(value) {
    if (value == null || typeof value == 'undefined' ) return false;
    return (value.length > 0);
   }

function isEmail(email) {
    let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(String(email).toLowerCase());
   }

function fieldValidation(field, validationFunction) {
    //If empty, field not valid
    if (field == null) return false;
   
    //If not empty, validate using the correct function
    let isFieldValid = validationFunction(field.value)
    if (!isFieldValid) {
        field.classList.add("fieldInvalid");
    } else {
        field.classList.remove("fieldInvalid");
    }
   
    return isFieldValid;
   }

function isValid() {
    var valid = true;

    valid &= fieldValidation(fields.name, isNotEmpty);
    valid &= fieldValidation(fields.email, isEmail);
    valid &= fieldValidation(fields.opmerkingen, isNotEmpty);
    
    return valid;
   }