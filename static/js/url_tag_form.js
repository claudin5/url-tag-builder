'use strict'

// hashmap for form's field values
let fieldValues = new Map()
fieldValues['group'] = $('.group').val();
fieldValues['department'] = $('.groupSubField').val();
fieldValues['category'] = $('#category').val();
fieldValues['url'] = undefined;
fieldValues['startDate'] = undefined;
fieldValues['campaign'] = undefined;
fieldValues['content'] = undefined;
fieldValues['typeType'] = undefined;
fieldValues['medium'] = undefined;
fieldValues['sources'] = [];

$(document).ready(function () {

    $.validator.setDefaults({
        errorClass: 'help-block',
        highlight: function (element) {
            if ($(element).prop('type') === 'radio' || $(element).prop('type') === 'checkbox') {
                $(element).closest('.form-group').addClass('group-invalid');
            } else {
                $(element).addClass('is-invalid');
            }
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('group-invalid');
            $(element).removeClass('is-invalid');
        },
        errorPlacement: function (error, element) {
            if (element.prop('type') === 'radio' || element.prop('type') === 'checkbox') {
                error.insertAfter(element.closest('.form-group'));
            } else {
                error.insertAfter(element);
            }
        }
    })

    $.validator.addMethod('hasAcceptedCharacters', function (value, element) {
        let re = /^[a-z0-9- _]+$/i;
        return re.test(value);
    }, "Only alphanumeric, space, and dash characters allowed.");

    $.validator.addMethod('hasAtLeastOneAlphanumeric', function (value, element) {
        let re = /[a-z0-9]/i;
        return re.test(value);
    }, "Requires at least one alphanumeric character.");

    $.validator.addMethod('isBlankOrHasAcceptedCharacters', function (value, element) {
        let re = /^[a-z0-9- _]*$/i;
        return re.test(value);
    }, "Only alphanumeric, space, and dash characters allowed.");

    $.validator.addMethod('isBlankOrHasAtLeastOneAlphanumeric', function (value, element) {
        if (value.length > 0) {
            let re = /[a-z0-9]/i;
            return re.test(value);
        } else {
            return true;
        }
    }, "Requires at least one alphanumeric character.");

    $("form").validate({
        rules: {
            url: {
                required: true,
                nowhitespace: true,
                normalizer: function (value) {
                    let url = value;

                    // Check if it doesn't start with http:// or https:// or ftp://
                    if (url && url.substr(0, 7) !== "http://" &&
                        url.substr(0, 8) !== "https://" &&
                        url.substr(0, 6) !== "ftp://") {
                        // then prefix with http://
                        url = "http://" + url;
                    }

                    // Return the new url
                    return url;
                }
            },
            month: {
                required: true
            },
            campaign: {
                required: true,
                hasAcceptedCharacters: true,
                hasAtLeastOneAlphanumeric: true
            },
            content: {
                isBlankOrHasAcceptedCharacters: true,
                isBlankOrHasAtLeastOneAlphanumeric: true
            },
            source: {
                required: true,
            }
        },
        messages: {
            url: {
                required: 'Required',
                url: "Please enter a valid URL. <em>i.e., 'https://www.google.com/'</em>"
            }
        }
    });

    $('.group').change(function () {
        displayGroupSubField($(this).val());
        // make user reselect value
        $(".groupSubField option").prop("selected", false);
        let group = $(this).val();
        fieldValues['department'] = undefined;
        generate_url();
    });

    $(".groupSubField").change(function () {
        if ($(this).valid()) {
            fieldValues['department'] = $(this).val();
        } else {
            fieldValues['department'] = undefined;
        }
        generate_url();
    });

    $("#category").change(function () {
        if ($(this).valid()) {
            fieldValues['category'] = $(this).val();
        } else {
            fieldValues['category'] = undefined;
        }
        generate_url();
    });

    $("#url").change(function () {
        if ($(this).valid()) {
            let input = $(this).val();
            fieldValues['url'] = input;
        } else {
            fieldValues['url'] = undefined;
        }
        generate_url();

    });

    $("#campaign").change(function () {
        if ($(this).valid()) {
            let input = $(this).val();
            input = input.toLowerCase()
            input = input.replace(/\s/g, '_');
            fieldValues['campaign'] = input;
        } else {
            fieldValues['campaign'] = undefined;
        }
        generate_url();
    });

    $("#content").change(function () {
        if ($(this).valid()) {
            let input = $(this).val();
            input = input.toLowerCase()
            input = input.replace(/\s/g, '_');
            fieldValues['content'] = input;
        } else {
            fieldValues['content'] = undefined;
        }
        generate_url();

    });

    $('input[name=TypeRadioOptions]').change(function () {
        if ($(this).valid()) {
            fieldValues['typeType'] = $(this).val();
        } else {
            fieldValues['typeType'] = undefined;
        }
        generate_url();
    });

    $('input[name=medium]').change(function () {
        if ($(this).valid()) {
            fieldValues['medium'] = $(this).val();
        } else {
            fieldValues['medium'] = undefined;
        }
        generate_url();

    });

    $('input[name=source]').change(function () {
        if ($(this).valid()) {
            fieldValues['sources'] = $('input[name=source]:checked').map(function () {
                return this.value
            });
        } else {
            console.log($(this).valid());
            fieldValues['sources'] = [];
        }
        generate_url();
    });


    let today = new Date();
    let monthPart = String(today.getMonth() + 1).padStart(2, '0');;
    let dayPart;
    let yearPart = String(today.getFullYear());

    for (let i = 2000; i < 3000; i++) {
        $('#year').append(`<option value="${i}">${i}</option>`);
    }

    $("#start-date").change(function () {
        if ($(this).valid()) {
            let date = $(this).val()
            let stringDate = date.replace(/-/g, '');

            let parts = date.split('-');
            yearPart = parts[0];
            monthPart = parts[1];
            dayPart = parts[2];
            fieldValues['startDate'] = stringDate;
        } else {
            fieldValues['startDate'] = undefined;
        }
        generate_url();

    });

    function checkDateParts() {
        if (monthPart != undefined && yearPart != undefined && $('#month').valid() && $('#year').valid()) {
            fieldValues['startDate'] = `${yearPart}${monthPart}00`
        }
        generate_url();
    }

    $('#entire-month').click(function () {
        $('#start-date-group').toggle();
        $('#entire-month-group').toggle();
        if ($('#start-date').is(':visible') && yearPart !== undefined && monthPart !== undefined && dayPart !== undefined) {
            $('#start-date').val(`${yearPart}-${monthPart}-${dayPart}`);
            if ($('#start-date').valid()) {
                fieldValues['startDate'] = `${yearPart}${monthPart}${dayPart}`;
                generate_url();
            }

        } else {
            $('#month').val(monthPart);
            $('#year').val(yearPart);
            checkDateParts();
        }

    })

    $('#month').change(function () {
        monthPart = $(this).val()
        checkDateParts()
    })

    $('#year').change(function () {
        yearPart = $(this).val()
        checkDateParts()
    })

    $(function () {
        $('[data-toggle="tooltip"]').tooltip({
            'container': 'button'
        })
    })

    // copy functinality for all of the textarea results
    $('#result-group').on('click', '.copy-button', function () {
        $('form').valid();

        let all = $('input,textarea,select').filter('[required]:visible')

        // copy generated url   
        let elementClicked = $(this);
        let inputText = $(elementClicked).closest('.input-group').find('textarea');
        $(inputText).focus();
        $(inputText).blur();
        inputText.select();

        try {
            let success = document.execCommand("copy");
            document.getSelection().removeAllRanges();

            if (inputText.val() === '') {
                $(this).tooltip({
                    container: 'button'
                })
                $(this).tooltip('dispose')
                $(this).attr('title', 'Copy Failed. Please complete required fields.')
                $(this).tooltip({
                    'delay': 500
                })
                $(this).tooltip('show')
                $(this).attr('data-original-title', 'Copy to Clipboard')
            } else if (success) {
                $(this).tooltip({
                    container: 'button'
                })
                $(this).tooltip('dispose')
                $(this).attr('title', 'Copied!')
                $(this).tooltip({
                    'delay': 500
                })
                $(this).tooltip('show')
                $(this).attr('data-original-title', 'Copy to Clipboard')
            } else {
                $(this).tooltip({
                    container: 'button'
                })
                $(this).tooltip('dispose')
                $(this).attr('title', 'Copy Failed')
                $(this).tooltip({
                    'delay': 500
                })
                $(this).tooltip('show')
                $(this).attr('data-original-title', 'Copy to Clipboard')
            }
        } catch (err) {
            $(this).tooltip({
                container: 'button'
            })
            $(this).tooltip('dispose')
            $(this).attr('title', 'Copy Failed')
            $(this).tooltip({
                'delay': 500
            })
            $(this).tooltip('show')
            $(this).attr('data-original-title', 'Copy to Clipboard')
        }
    });
});

function generate_url() {
    if (fieldValues['department'] !== undefined &&
        (fieldValues['url'] !== '' && fieldValues['url'] !== undefined) &&
        (fieldValues['startDate'] !== undefined && fieldValues['startDate'] !== '') &&
        (fieldValues['campaign'] !== undefined && fieldValues['campaign'] !== '') &&
        fieldValues['medium'] !== undefined &&
        fieldValues['typeType'] !== undefined &&
        fieldValues['sources'].length > 0 &&
        fieldValues['category'] !== undefined) {

        // remove extra output fields
        $('.result-group-add').remove();

        for (let i = 0; i < fieldValues['sources'].length; i++) {
            let marketSource =
                `ms=${fieldValues['department']}-` +
                `${fieldValues['typeType']}-` +
                `${fieldValues['medium']}-` +
                `${fieldValues['sources'][i]}-` +
                `${fieldValues['category']}-` +
                `${fieldValues['startDate']}_${fieldValues['campaign']}`;
            marketSource = marketSource.length > 150 ? marketSource.slice(0, 150) : marketSource;
            let utmSource = `&utm_source=${fieldValues['sources'][i]}`;
            let utmMedium = `&utm_medium=${fieldValues['medium']}`;
            let utmCampaign = `&utm_campaign=${fieldValues['startDate']}_${fieldValues['campaign']}`;
            let utmContent = fieldValues['content'] ? `&utm_content=${fieldValues['content']}` : '';

            if (i === 0) {
                $('#first-result').text(`Generated URL (${fieldValues['sources'][i]})`)
                $('#first-generated-url').val(`${fieldValues['url']}?${marketSource}${utmSource}${utmMedium}${utmCampaign}${utmContent}`);
            } else {
                $('#result-group').append(`
                    <div id="result-group" class="result-group-add">
                    <label for="">Generated URL (${fieldValues['sources'][i]})</label>
                    <div class="input-group mb-3">
                        <textarea id="generated-url" class="form-control generated-url" placeholder="Complete all required fields." type="url" name="" id=""  rows="2" readonly>${fieldValues['url']}?${marketSource}${utmSource}${utmMedium}${utmCampaign}${utmContent}</textarea>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary copy-button" data-toggle="tooltip"  type="button" title="Copy to Clipboard">Copy</button>
                        </div>
                        </div>
                    </div>`);

                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })
            }
        }
    } else {
        resetResults();
    }
}

function resetResults() {
    $('#first-result').text(`Generated URL`);
    $('#first-generated-url').val('Please complete all required fields.');
    $('.result-group-add').remove();
}

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function displayGroupSubField(group) {
    $('#nationalField').hide();
    $('#stateField').hide();
    $(`#${group}Field`).show();
}