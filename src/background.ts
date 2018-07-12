declare var gapi;


function polling() {
    console.log('polling');
    setTimeout(polling, 1000 * 30);
}

polling();

chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);
    gapi.load('client', function () {
        gapi.client.setToken({ access_token: token });
        gapi.client.load('drive', 'v3', loadDrive)
    })
});

function loadDrive() {
    console.log(gapi.client.drive.changes)
    gapi.client.drive.changes.getStartPageToken({})
        .execute(function (res) {
            if (!res.error) {
                console.log(res.startPageToken)
                gapi.client.drive.changes.list({ pageToken: res.startPageToken })
                    .execute(function (res) {
                        console.log("changes", res)
                    })
            }
            else {

            }
        })
}