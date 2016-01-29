// We need the host root URL to execute the AJAX calls
baseURL = window.location.protocol + "//" + window.location.host;

// News list template
var template = '<li class="list-group-item"><a href="#LINK#" target="_blank">#TITLE#</a></li>';

// Busy Processing Indicator
$.ajaxSetup({
    beforeSend: function () {
        $("#loading").show();
    },
    complete: function () {
        $("#loading").hide();
    }
});


//AJAX Call to refresh the Main Panel after user clicks on a menu item
function refreshNewsSource(obj) {

    var params;
    var id = obj.attr('id');

    params = {
        ns: id
    };

    // For local News Sources we have to fecth JQuery.data to know the location (eg.: DF, SP, etc.)
    if (id == 'local') {
        params.local = obj.data('state');
    }

    // AJAX call to refresh the news source
    $.get(
        baseURL + '/most_read_ns',
        params,
        function (responseContent) {
            //Set the title of the news
            $('#aml-source').text(responseContent.header);

            //Remove old news
            $('.list-group-item', '#aml-list').remove();

            //Now set the list of news
            var newsList = $('#aml-list');
            for (var i = 0; i < responseContent.news.length; i++) {
                var n = template.replace('#LINK#', responseContent.news[i].link).replace('#TITLE#', responseContent.news[i].title);
                newsList.append(n);
            }
        },
        'json'
    );
}

/*
 Activates selected menu item (and deactivates previous selected menu item)
 */
function toggleMenuItem(menuItem) {
    //Remove previous selected item
    $('#aml-menu > a.list-group-item').removeClass('active');
    //Activate current menu item
    menuItem.addClass('active');
    $(this).addClass('active');
}

/*
 Changes between National and International news source
 Activates selected menu (based on the first news source of the national or international list)
 */

$('.aml-btn').click(function () {

    var id = $(this).attr('id');
    var firstItem;

    if (id == 'btn-national') {
        $('.national').css('display', 'block');
        $('.international').css('display', 'none');
        firstItem = $('.national').first();

    } else {
        $('.national').css('display', 'none');
        $('.international').css('display', 'block');
        firstItem = $('.international').first();
    }
    toggleMenuItem(firstItem);
    refreshNewsSource(firstItem);
});

/*
 Select and refresh news source
 */
$('#aml-menu > a.list-group-item').click(function () {
    toggleMenuItem($(this));
    refreshNewsSource($(this));
});

/*
 Change page language
 */
$('#lang').click(function () {
    var lang = $(this);

    if (lang.text().toLowerCase() == 'english') {
        //We're changing to English
        $('#aml-title').html('<h1 id="aml-title">The Most Read <small>news you want to read.</small>');
        $('#aml-description').text("Here you find the most read news from popular" +
            " News Websites from all around the world. " +
            "If you are in Brazil, we'll try to show you some regional news from your location*");
        $('#btn-national').text('National');
        $('#btn-international').text('International');
        $('#label-select-location').text('Change your location*');

        $('#lang').text('PORTUGUÊS');
        $('#contact').text('CONTACT');
        $('#about').text('ABOUT');

        //About Modal
        $('#about-header').text('About');
        $('.modal-footer > .btn-default').text('Close'); // Works for the Contact modal too
        $('#about-modal-body').html('<p><b>As Mais Lidas (The Most Read)</b> is a website for those who want to get ' +
            'straight to the point.</p><p>The idea came thinking about those who have no time (or desire) to navigate ' +
            'multiple websites just to find that which matters the most.</p><p> Here you can find, in a single place, the most ' +
            'read news from the biggest News Websites from all around the world and get information in a matter ' +
            'of minutes!</p> <p> Furthermore, if you are in Brazil, we will try to discover your location through ' +
            'the use of the IP Geolocation* technology (GeoIP).</p>' +
            '<p> If you have any doubts or suggestions, please contact us by clicking the "CONTACT" link on top right ' +
            'corner of the page. With our thanks, have a great time and get informed!</p> <p><em>The GeoIP technology ' +
            'is possible thanks to http://www.localizaip.com.br. Although modern, this technology has some accuracy limitations.</em>  </p>');

        //Contact Modal
        $('#contact-header').text('Contact');
        $('#name-label').text('Name');
        $('#message-label').text('Message');
        $('#contact-name').attr('placeholder', 'Enter your name');
        $('#contact-email').attr('placeholder', 'Enter your email');
        $('#contact-message').attr('placeholder', 'Enter your message with suggestions, bug reports or anything else you think is important');
        $('#email').attr('placeholder', 'Enter email');
        $('#btn-submit-contact').text('Send');
    } else {
        //We're changing back to Portuguese
        window.location.reload(baseURL);
    }
});

/*
 Change user location
 */
$('#select-location').change(function () {
    var location = $(this).val();

    if (location == '')
        return;

    $.get(
        baseURL + '/change_location',
        {
            location: location
        },
        function (responseContent) {
            $('#local').text(responseContent.ns_name + '*');
            $('#local').data('state', location.replace('local', '')); // e.g (localAC -> AC)
        },
        'json'
    );
});

/*
 Resets modal fields and error messages
 :param modalId: the id of the modal to be reset
 */
function resetModal(modalId) {
    $(modalId).find('form').trigger('reset'); //Resets all input fields
    $(modalId).find('div').removeClass('has-error'); //Removes error class
    $(modalId).find('p.text-danger').text(''); //Removes field error messages
    $(modalId).find('div.alert').remove(); //Removes alert messages
}

/*
 Resets modal fields and error messages when modal is opened
 */
$('*[data-toggle="modal"]').click(function () {
    var modalId = $(this).attr('data-target');
    resetModal(modalId);
});

/*
 Hides a specific modal (and removes backdrop overlay)
 param: id: the ID of the modal to be hidden
 */
/*function hideModal(id) {
 $(id).modal('hide');
 $('body').removeClass('modal-open');
 $('.modal-backdrop').remove();
 }*/

/*
 Shows an error message for a specific form element
 :param id: the form element id
 :param message: the error message to be shown
 */
function fieldError(id, message) {
    $(id).next('p').text(message);
    $(id).parent('div.form-group').addClass('has-error');
}

/*
 Shows a sucess message alert
 param: formId: the id of the form related to the message
 para: message: the message content to be shown
 */
function showSuccessMessage(formId, message) {
    var successMessage = '<div class="alert alert-success" role="alert">#MESSAGE#</div>'.replace('#MESSAGE#', message);
    $(successMessage).insertBefore(formId);
}

/*
 Submit contact message
 */
$('#btn-submit-contact').click(function () {
    $.post(
        baseURL + '/send_message',
        $('#contact-form').serialize(),
        function (data) {
            if (data.error) {
                if (data.name != undefined) fieldError('#contact-name', data.name[0]);
                if (data.email != undefined) fieldError('#contact-email', data.email[0]);
                if (data.message != undefined) fieldError('#contact-message', data.message[0]);
            } else {
                resetModal('#contact-modal');
                showSuccessMessage('#contact-form', 'Mensagem enviada com sucesso');
            }
        },
        'json'
    );
});

