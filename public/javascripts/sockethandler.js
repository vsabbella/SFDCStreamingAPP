var socket = io.connect();

socket.on('connect', function () {
    $('#status').append('<b>Connected!</b>');
});

socket.on('streamingmsg', function (data) {
    
    //add record for new donation
    $('#changelog').append(data.name + ' - <span style=\"color:green\">$' + data.amount +'</span><br>');
});
