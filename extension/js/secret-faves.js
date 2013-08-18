$(function() {

	var galleries_a,
		galleries_li,
		matches,
		faved,
		photo_id,
		photo_ids;

	galleries_a = $('div#explore-panel ul li a[data-track=Explore-galleries]');

	if (galleries_a) {

		galleries_li = galleries_a.parent();
		$('<li class="gn-subnav-item"><a href="#" id="secret-faves-link">Secret Faves</a></li>').insertBefore(galleries_li);

	} else {

		return;

	}

    chrome.storage.local.get('url', function(items) {

    	if (items && items.url) {
    		$('#secret-faves-link')[0].href = items.url;
    	} else {
    		$('#secret-faves-link').hide();
    	}

    });

	matches = window.location.href.match(/photos\/(([0-9]+@N[0-9]+)|([0-9a-zA-Z-_]+))\/([0-9]+)\/?/);

	if (!(matches && matches.length >= 4)) {
		return;
	}

	$('ul#stats_ul').prepend('<li class="divider"><span><span>&nbsp;</span></span></li>')
	$('ul#stats_ul').prepend('<li class="stat-item"><a id="secret-fave" href="#"><span class="secret-star"></span>&nbsp;</a></li>');

	faved = false;

	photo_id = matches[4];

    photo_ids = {};

    chrome.storage.local.get(['photo_ids'], function(items) {

    	if (items && items.photo_ids) {
    		photo_ids = items.photo_ids;
    	}

    	if (typeof photo_ids[photo_id] !== 'undefined') {
    		$('#secret-fave .secret-star').addClass('faved');
    		faved = true;
    	}

    	var toggle = function() {

    		var owner;

			matches = window.location.href.match(/photos\/(([0-9]+@N[0-9]+)|([0-9a-zA-Z-_]+))\/([0-9]+)\/?/);
			owner = matches[1];
			photo_id = matches[4];

	    	faved = typeof photo_ids[photo_id] !== 'undefined';

			if (faved) {
				delete photo_ids[photo_id];
			} else {

				photo_ids[photo_id] = {
					owner: owner,
					favedate: new Date().getTime()
				};

			}

			chrome.storage.local.set({'photo_ids': photo_ids}, function() {

				faved = !faved;

				if (faved) {
					$('#secret-fave .secret-star').addClass('faved');
				} else {
					$('#secret-fave .secret-star').removeClass('faved');
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

		var updateLink = function() {

			var local_photo_id, photos, photo;

			if (jQuery.isEmptyObject(photo_ids)) {
				$('#secret-faves-link').hide();
				chrome.storage.local.remove('url');
				return;
			}

			$('#secret-faves-link').show();

			photos = [];

			for (local_photo_id in photo_ids) {
				photo = photo_ids[local_photo_id];
				photo.id = local_photo_id;
				photos.push(photo);
			}

			photos = photos.sort(function (a, b) {
			    return b.favedate - a.favedate;
			});

			var first_photo = photos[0];

			var url = 'http://www.flickr.com/photos/' + first_photo.owner + '/' + first_photo.id + '/in/photolist';

			for (var index in photos) {

				photo = photos[index];
				url += '-' + getShortUrlCode(photo.id);

			}

			url += '/lightbox/';

			$('#secret-faves-link')[0].href = url;

			chrome.storage.local.set({'url': url});

			return url;

		};

    	$(window).keypress(function(e) {

			var code = (e.keyCode ? e.keyCode : e.which);
			if (code === 100) {

				toggle();
				updateLink();
				e.preventDefault();

			} else if (code === 68) {

				var url = updateLink();
				if (url) {
					window.location.href = url;
				}
				e.preventDefault();

			}

    	});

		$('#secret-fave').click(function(e) {

			toggle();
			updateLink();
			e.preventDefault();

		});

		$('#secret-fave').bind('contextmenu', function() {

			var url = updateLink();
			if (url) {
				window.location.href = url;
			}

			return false;
		});

    });

});