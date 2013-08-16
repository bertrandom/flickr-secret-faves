$(function() {

	var matches = window.location.href.match(/photos\/(([0-9]+@N[0-9]+)|([0-9a-zA-Z-_]+))\/([0-9]+)\/?/);

	if (!(matches && matches.length >= 4)) {
		return;
	}

	$('ul#stats_ul').prepend('<li class="divider"><span><span>&nbsp;</span></span></li>')
	$('ul#stats_ul').prepend('<li class="stat-item"><a id="secret-fave" href="#"><span class="secret-star"></span>&nbsp;</a></li>');

	var faved = false;

	var photo_id = matches[4];

    var api_key = null;
    var secret = null;
    var auth_hash = null;

    $('script').each(function(index, el) {

      var re = /"api_key":"([0-9a-z]*)"/
      var content = $(el).html();
      var result = content.match(re);

      if (result && result.length >= 2) {
        api_key = result[1];
      }

      var re = /"secret":"([0-9a-z]*)"/
      var content = $(el).html();
      var result = content.match(re);

      if (result && result.length >= 2) {
        secret = result[1];
      }

    });

    var magic_cookie_input = $('input[name="magic_cookie"]');

    if (magic_cookie_input) {
    	auth_hash = magic_cookie_input.val();
    }

    var photo_ids = {};

    chrome.storage.local.get('photo_ids', function(items) {

    	if (items && items.photo_ids) {
    		photo_ids = items.photo_ids;
    	}

    	if (typeof photo_ids[photo_id] !== 'undefined') {
    		$('#secret-fave .secret-star').addClass('faved');
    		faved = true;
    	}

    	var toggle = function() {

			var matches = window.location.href.match(/photos\/(([0-9]+@N[0-9]+)|([0-9a-zA-Z-_]+))\/([0-9]+)\/?/);
			photo_id = matches[4];

	    	faved = typeof photo_ids[photo_id] !== 'undefined';

			if (faved) {
				delete photo_ids[photo_id];
			} else {
				photo_ids[photo_id] = new Date().getTime();
			}

			chrome.storage.local.set({'photo_ids': photo_ids}, function() {

				faved = !faved;

				if (faved) {
					$('#secret-fave .secret-star').addClass('faved');
				} else {
					$('#secret-fave .secret-star').removeClass('faved');

					// if (window.location.href.match(/photolist/)) {
					// 	if (window.location.href.indexOf('-' + getShortUrlCode(photo_id)) !== -1) {
					// 		viewFaves();
					// 	}
					// }

				}
				
			});

    	};

		var getShortUrlCode = function(num) {
			if (typeof num!=='number') num = parseInt(num);
			var enc='';
			var alpha='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
			var div=num;
			while(num>=58){
				div=num/58;
				var mod=(num-(58*Math.floor(div)));
				enc=''+alpha.substr(mod,1)+enc;
				num=Math.floor(div);
			} 
			return(div)?''+alpha.substr(div,1)+enc:enc;
		};

		var viewFaves = function() {

			if (photo_ids.length === 0) {
				return;
			}

			for (first_photo_id in photo_ids) break;

			$.get('http://www.flickr.com/services/rest/', {
				format: 'json',
				clientType: 'yui-3-flickrapi-module',
				method: 'flickr.photos.getInfo',
				api_key: api_key,
				auth_hash: auth_hash,
				auth_token: null,
				photo_id: first_photo_id,
				nojsoncallback: 1
			}, function(response, textStatus, jqXHR) {

				var url = 'http://www.flickr.com/photos/' + response.photo.owner.nsid + '/' + first_photo_id + '/in/photolist';
				for (faved_photo_id in photo_ids) {
					url += '-' + getShortUrlCode(faved_photo_id);
				}
				window.location.href = url;

			}, 'json');

		};

    	$(window).keypress(function(e) {

			var code = (e.keyCode ? e.keyCode : e.which);
			if (code === 68 || code === 100) {

				toggle();
				e.preventDefault();

			} else if (code === 82 || code === 114) {

				viewFaves();
				e.preventDefault();

			}

    	});

		$('#secret-fave').click(function(e) {

			toggle();
			e.preventDefault();

		});

    });

});
