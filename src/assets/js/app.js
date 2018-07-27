import $ from 'jquery';
import mask from 'jquery-mask-plugin';
import whatInput from 'what-input';

window.jQuery = window.$ = $;

// import Foundation from 'foundation-sites';
// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
import './lib/foundation-explicit-pieces';


/**
 * Custom Form Validators
 * Foundation - Abide
 */

// Phone Number Validator
const phoneNumberValidator = ($el, required) => {
    if (!required) return true;
    const phoneNumber = $el.val().replace(/\D/g, '');

    return (phoneNumber.length === 10 || phoneNumber.length === 11);
};
Foundation.Abide.defaults.validators['br_phone_number'] = phoneNumberValidator;

// CPF Validator
const testaCPF = (strCPF) => {
    let soma = 0;
    let resto;

    if (strCPF === '00000000000') return false;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if ((resto == 10) || (resto == 11)) {
        resto = 0;
    }
    if (resto != parseInt(strCPF.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if ((resto == 10) || (resto == 11)) {
        resto = 0;
    }
    if (resto != parseInt(strCPF.substring(10, 11))) return false;
    
    return true;
}

const cpfValidator = ($el, required) => {
    if (!required) return true;
    const cpfNumber = $el.val().replace(/\D/g, '');

    return testaCPF(cpfNumber);
};
Foundation.Abide.defaults.validators['cpf'] = cpfValidator;

/**
 * Initialize the Foundation FW
 */
$(document).foundation();


(function ($) {

    /**
     * Input Masks
     */

    // Phone Number
    const phoneMaskBehavior = (val) => val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
    const phoneOptions = {
        placeholder: '(  ) ____-____',
        onKeyPress: function (val, e, field, options) {
            field.mask(phoneMaskBehavior.apply({}, arguments), options);
        }
    };

    $('.js-mask-phone').mask(phoneMaskBehavior, phoneOptions);

    // CPF
    $('.js-mask-cpf').mask('000.000.000-00', { reverse: true });


    /**
     * MultiStep Form
     */

    let currentTab = 0;

    const tabWrapper = document.getElementById('formTab');
    const tabNumber = document.querySelector('.js-contact-form__tab-number');
    const bullets = document.getElementsByClassName('js-contact-form__tab-bullet');
    const panels = document.getElementsByClassName('js-contact-form__panels');

    const $form = $('.js-contact-form');
    const $nextButton = $('.js-contact-form__next-button');
    const $messageBox = $('.js-contact-form__message');

    const IS_COMPLETED_CLASS = 'is-completed';
    const SUCCESS_CLASS = 'success';
    const SUCCESS_MESSAGE = 'Formulário enviado com sucesso!';
    const ERROR_CLASS = 'alert';
    const ERROR_MESSAGE = 'Ops! Ocorreu um erro, tente novamente.';

    const goToTab = (id, isReset = false) => {
        if (!isReset && !isFormValid(panels[currentTab], $form)) return false;

        if (!isReset) {
            $(bullets[currentTab]).addClass(IS_COMPLETED_CLASS);
        } else {
            $(bullets).removeClass(IS_COMPLETED_CLASS);
        }

        currentTab = id;
        $(tabWrapper).foundation('_handleTabChange', $(bullets[currentTab]));
        tabNumber.innerText = currentTab + 1;

    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!isFormValid(panels, $form)) return false;

        fakeSubmit()
            .then((data) => {
                if (!data.error) {
                    resetForm();
                    $messageBox
                        .addClass(SUCCESS_CLASS)
                        .html(`<span>${SUCCESS_MESSAGE}</span>`)
                        .fadeIn();
                } else {
                    $messageBox
                        .addClass(ERROR_CLASS)
                        .html(`<span>${ERROR_MESSAGE}</span>`)
                        .fadeIn();
                }

                setTimeout(() => {
                    $messageBox
                        .fadeOut(400, () => {
                            $messageBox
                                .removeClass(SUCCESS_CLASS)
                                .removeClass(ERROR_CLASS)
                                .html('');
                        })
                }, 8000);
            });
    };

    const resetForm = () => {
        $form[0].reset();
        $form.foundation('resetForm');
        goToTab(0, true);
    }

    const isFormValid = (panel, $form) => {
        const $inputs = $(panel).find('input, select');
        $inputs.map((i, el) => $form.foundation('validateInput', $(el)));

        return $inputs.filter('.is-invalid-input').length === 0;
    };

    $nextButton.on('click', () => goToTab(1));
    $form.on('submit', submitForm);

    // Prevent bullets to change the tab
    $(bullets).on('click', () => false);


    // Fake Function to submit form
    const fakeSubmit = () => Promise.resolve({
        error: false
    });


})($);