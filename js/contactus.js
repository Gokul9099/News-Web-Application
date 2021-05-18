$('form').on('submit', (e) => {

    e.preventDefault();
    const email = $('#email').val().trim();
    const subject = $('#subject').val().trim();
    const text = $('#text').val().trim();

    const data = {
        email,
        subject,
        text
    };
    console.log(data);
    $.post('/email', data, function () {
        console.log('server received data');
    });
});

