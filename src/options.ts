import * as moment from 'moment';
import * as $ from 'jquery';

function onload() {

}

function signin() {
  chrome.identity.getAuthToken({interactive: true}, function(token) {
    console.log(token);
  });
}


$('#signin').click(signin);

