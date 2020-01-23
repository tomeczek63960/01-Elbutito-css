(function () {
    'use strict';

    let validationFunctionWrapper = function ($form, formName, validationRules, validators) {
        let getSelector = function (formName, name) {
            let selector = `${formName}[${name}]`;
            if (validationRules[name].isGroup) selector = `${selector}[]`;
            return selector;
        };
        let getFormFields = function ($form, selector) {
            let fullSelector = `[name="${selector}"]`;
            return $form.querySelectorAll(fullSelector);
        };
        let isRadioOrCheckbox = function (formField) {
            return (formField.type === 'radio' || formField.type === 'checkbox');
        };
        let getErrorWrapper = function (inp) {
            let errorWrapper = inp.parentNode;
            while (!errorWrapper.classList.contains('form-field-wrapper')) {
                errorWrapper = errorWrapper.parentNode;
            };
            return errorWrapper.querySelector('.error-wrapper');
        };

        let getValueFields = function (formFields) {
            let value = [];
            if (typeof formFields.length === 'number') {
                if (formFields.type === 'select-one') {
                    value.push(formFields.value);
                } else {
                    if (isRadioOrCheckbox(formFields[0])) {
                        formFields.forEach(field => {
                            if (field.checked) {
                                value.push(field.value);
                            };
                        });
                    } else {
                        formFields.forEach(field => {
                            value.push(field.value);
                        });
                    };
                };
            } else {
                if (isRadioOrCheckbox(formFields)) {
                    if (formFields.checked) {
                        value.push(formFields.value)
                    };
                } else {
                    value.push(formFields.value);
                };
            };
            return value;
        };
        let showError = function (result, errorWrapper) {
            errorWrapper.textContent = result.message;
        };
        let getValidationResult = function (value, errorWrapper, validationRule, formFields) {
            let validationReguls = validationRules[validationRule].validation;
            for (let validationRegul in validationReguls) {
                let validationFunction = validators[validationRegul];
                let result = validationFunction(value, validationReguls);
                if (!result.valid) {
                    if (errorWrapper.textContent !== '') return;
                    showError(result, errorWrapper);
                    formFields.forEach(field => {
                        field.classList.add("invalid");
                        field.classList.remove('valid');
                    });
                } else {
                    errorWrapper.textContent = '';
                    formFields.forEach(field => {
                        field.classList.add("valid");
                        field.classList.remove('invalid');
                    });
                };
            };
        };
        let validate = function (inp) {
            for (let validationRule in validationRules) {
                let isGroup = validationRules[validationRule].isGroup;
                let selector = getSelector(formName, validationRule);
                let formFields = getFormFields($form, selector);
                let errorWrapper = getErrorWrapper(formFields[0]);
                if (inp) {
                    if (isRadioOrCheckbox(inp)) {
                        if (inp.dataset.group) {
                            if (isGroup) {
                                let value = getValueFields(formFields);
                                let result = getValidationResult(value, errorWrapper, validationRule, formFields);
                            };
                        } else {
                            formFields.forEach(field => {
                                if (field === inp) {
                                    let value = getValueFields(inp);
                                    let result = getValidationResult(value, errorWrapper, validationRule, formFields);
                                };
                            });
                        };
                    } else {
                        if (formFields[0] === inp) {
                            let value = getValueFields(inp);
                            let result = getValidationResult(value, errorWrapper, validationRule, formFields);
                        };
                    };
                } else {
                    let value = getValueFields(formFields);
                    let result = getValidationResult(value, errorWrapper, validationRule, formFields);
                };
            };
        };
        let onClick = function () {
            validate(this);
        };
        let onBlur = function () {
            validate(this);
        };
        let onSubmit = function (e) {
            validate();
            let invalid = document.querySelector('.invalid');
            invalid.focus();
            let errorWrappers = $form.querySelectorAll(".error-wrapper");
            errorWrappers.forEach(errorWrapper => {
                if (errorWrapper.textContent !== '') {
                    e.preventDefault();
                };
            });
        };
        let setEventForFields = function () {
            for (let validationRule in validationRules) {
                let selector = getSelector(formName, validationRule);
                let formFields = getFormFields($form, selector);
                if (!formFields) {
                    return;
                } else if (isRadioOrCheckbox(formFields[0])) {
                    formFields.forEach(field => {
                        field.addEventListener('click', onClick);
                    });
                } else {
                    formFields.forEach(field => {
                        field.addEventListener('blur', onBlur);
                    });
                };
            };
        };
        setEventForFields();
        $form.addEventListener('submit', onSubmit);
    };
    let init = function () {
        let $form = document.querySelector(".contact-form");
        let formName = 'contactform';
        let validationRules = {
            name: {
                validation: {
                    notBlank: {},
                    regex: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
                }
            },
            email: {
                validation: {
                    notBlank: {},
                    regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|} ~-]+(?: \.[a - z0 - 9!#$ %& '*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
                }
            },
            phone: {
                validation: {
                    notBlank: {},
                    length: 9,
                    regex: /^[+]*[(]{0,1}[0-9]{0}[)]{0,1}[-\s\.0-9]{9}$/,
                }
            },
            reason: {
                special: true,
                validation: {
                    notBlank: {}
                }
            },
            client: {
                validation: {
                    notBlank: {}
                }
            },
            contactday: {
                validation: {
                    quantiti: {
                        min: 2,
                        max: 4
                    }
                },
                isGroup: true,
            },
            message: {
                validation: {
                    notBlank: {},
                }
            },
            approval: {
                validation: {
                    notBlank: {},
                }
            }

        };
        let validators = {
            notBlank: function (value, option) {
                value = value.join();
                value = value.trim();
                return value.length > 0 ? { valid: true } : { valid: false, message: "Pole nie może być puste" };
            },
            regex: function (value, option) {
                value = value.join();
                value = value.trim();
                let patt = option.regex;
                return patt.test(value) ? { valid: true } : { valid: false, message: "Niepoprawna skłania" };
            },
            quantiti: function (value, option) {
                let min = option.quantiti.min;
                let max = option.quantiti.max;
                return (value.length <= max && value.length >= min) ? { valid: true } : { valid: false, message: "Zaznacz między 2 a 4 pola" };
            },
            length: function (value, option) {
                value = value.join().trim();
                let length = option.length;
                return value.length === length ? { valid: true } : { valid: false, message: `Wymagana ilość ${length} znaków` };
            }
        };
        validationFunctionWrapper($form, formName, validationRules, validators);
    }
    init();
}());