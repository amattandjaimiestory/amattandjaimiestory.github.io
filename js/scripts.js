var panel = 0;
var prev_disabled = true;
var next_disabled = false;

function reset_comic_vars() {
	var panel = 0;
	var prev_disabled = true;
	var next_disabled = false;
}

var LAST_PANEL = 10;

$(document).ready( function() {
	$.ajaxSetup({ cache: false });
	
	$(window).bind('hashchange', function() {
		
		h = location.hash.split("/");
		reset_comic_vars();
		
		if ( h[0] == "" || (h[0] != "" && h[1] == "") ) {
			$.get('home.html', function(dat) { $('#main').html(dat) });
			$('nav[role="menu"] a').removeClass('selected');
			$('nav[role="menu"] a:first').toggleClass('selected');
		}
		else {
			
			$('nav[role="menu"] a').removeClass('selected').parent().find('#'+h[1]).toggleClass('selected');
			
			$.get( h[1] + '.html' , function(dat) {
				$('#main').html(dat);
				if ( h[2] != null ) { $('html, body').animate({scrollTop:$('#invitation').offset().top}, 500); }
				$('table.load').remove();
				$('#main').css('opacity', 1.0);
			});
		}
	});
	
	$(window).trigger('hashchange');
	
	$('nav[role="menu"] a').click( function() {
		$('nav[role="menu"] a.selected').removeClass();
		$(this).toggleClass('selected');
		
		$('#main').css('opacity', 0.25);
		$('body').append('<table class="load" style="text-align:center;position:absolute;top:'+$('#main').offset().top+'px;left:'+$('#main').offset().left+'px;width:'+$('#main').width()+'px;height: 100px;"><tr><td><img src="img/loader.gif"></td></tr></table>');
		
		location.hash = '!/' + this.id;
		
		return false;
	});
	
	$('body').on('click', 'nav[role="browse"] #prev', function() {
		if ( prev_disabled ) { return false; }
		else if ( next_disabled ) {
			$('#next').css({opacity: 1, cursor: 'pointer'});
			next_disabled = false;
		}
		panel -= 1;
		
		$('#panels').css('opacity', 0.20);
		$('body').append('<table class="load" style="text-align:center;position:absolute;top:'+$('#panels').offset().top+'px;left:'+$('#panels').offset().left+'px;width:'+$('#panels').width()+'px;height: 100px;"><tr><td><img src="img/loader.gif"></td></tr></table>');
		
		if ( panel == 0 ) {
			$(this).css({opacity: 0.3, cursor: 'default'});
			prev_disabled = true;
		}
		
		$.get('/panels/'+panel+'.html', function(data) {
			$('#panels').html(data);
			$('table.load').remove();
			$('#panels').css('opacity', 1.0);
		});

		return false;
	});
	
	$('body').on('click', 'nav[role="browse"] #next', function() {
		if ( next_disabled ) { return false; }
		else if ( prev_disabled ) { prev_disabled = false; }
		panel += 1;
		
		$('#panels').css('opacity', 0.20);
		$('body').append('<table class="load" style="text-align:center;position:absolute;top:'+$('#panels').offset().top+'px;left:'+$('#panels').offset().left+'px;width:'+$('#panels').width()+'px;height: 100px;"><tr><td><img src="img/loader.gif"></td></tr></table>');
		
		if ( panel == 1 ) { $('#prev').css({opacity: 1, cursor: 'pointer'}); }
		else if ( panel == LAST_PANEL ) { $('#next').css({opacity: 0.3, cursor: 'default'}); next_disabled = true; }
		
		$.get('/panels/'+panel+'.html', function(data) {
			$('#panels').html(data);
			$('table.load').remove();
			$('#panels').css('opacity', 1.0);
		});

		return false;
	});
	
	$(document).live('keydown', function(e) {
		if (e.keyCode == 37) {
			$('#prev').trigger('click');
		}
		else if (e.keyCode == 39) {
			$('#next').trigger('click');
		}
	});
	
	$('body').on('click', '#panels #yes', function() {
		$.get('/panels/yes.html', function(data) {
		  $('#panels').html(data);
		});
	});

	changeRate = 20;
	
	$('body').on('mouseenter mousedown', '#panels #no', function(e) {
		px=$('#panels').offset()['left'];
		py=$('#panels').offset()['top'];
		mx=e.pageX;
		my=e.pageY;
		nx=$(this).offset()['left'];
		ny=$(this).offset()['top']
		w=$(this).width();
		h=$(this).height();
				
		if ( mx <= (w/2.0 + nx) && my <= (h/2.0 + ny)	) { // se
			dx=nx+changeRate;
			dy=ny+changeRate;
		}
		else if ( mx >= (w/2.0 + nx) && my <= (h/2.0 + ny)	) { // sw
			dx=nx-changeRate;
			dy=ny+changeRate;
		}
		else if ( mx <= (w/2.0 + nx) && my >= (h/2.0 + ny)	) { // ne
			dx=nx+changeRate;
			dy=ny-changeRate;
		}
		else if ( mx >= (w/2.0 + nx) && my >= (h/2.0 + ny)	) { // nw
			dx=nx-changeRate;
			dy=ny-changeRate;
		}
		
		if ( dx > (px+$('#panels').width()) ) { dx -= (2*changeRate); }
		if ( dx < px ) { dx += (2*changeRate); }
		if ( dy > (py+$('#panels').height()) ) { dy -= (2*changeRate); }
		if ( dy < py ) { dy += (2*changeRate); }
		
		$(this).css({position: 'absolute'}).offset({left: dx, top: dy});
		
		return false;
	});
	
	$('#panels').on('mousedown', '#last_panel_pic', function(e) {
		e.preventDefault()
	});
	
	$('.error').live('click', function() { $(this).remove() });
	
	$(document).on('submit', '#shout_form', function() {
        $('form#shout_form textarea').val('Press submit all you want, but it wont make it work.')
		return false;
	});
	
	$('#changed_mind').live('click', function() {
		$('#rsvp_form').show();
		$(this).hide();
		$('html,body').scrollTop( $(document).height() );
	});

	party_size = 0;	
	$('#rsvp_form a.attendance').live('click', function() {
		$('#rsvp_form').html('<div style="text-align:center;"><img src="/img/loader.gif"></div>');
		$.get( '/update_attendance.php?code='+$('#rsvp_code').val()+'&is_attending='+((this.id == 'attending') ? '1' : '0'), function( data ) {
			$('.invite ul li.rsvp').html( data )
			$('#rsvp_form').css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 2000);		
	        party_size = $("input[name='party_size']").val();
			$('html,body').scrollTop( $(document).height() );
		});
	});
	
	$('#update_psa').live('click', function() {
		if ( parseInt($("input[name='party_size']").val()) > parseInt(party_size) ) {
        		$(this).val(party_size);

        		if( $('#too_big').css('display') == 'none') {
        			$('#too_big').slideToggle(200).css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 500);
        		}
        		else {
        			$('#too_big').css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 500);
        		}
        		
        		return false;
        	}
        	
		psa = {};
		psa.code = $('#rsvp_code').val();
		psa.party_size = $('input[type="text"][name="party_size"]').val();
		psa.guest_names = $('textarea[name="guest_names"]').val();
		
		$('#rsvp_form').html('<div style="text-align:center;"><img src="/img/loader.gif"></div>');
		
		$.post( '/update_psa.php', psa, function( data ) {
			$('.invite ul li.rsvp').html( data )
			$('#rsvp_form').css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 2000);
			$('html,body').scrollTop( $(document).height() );
		});
	});
	
	$('#rsvp_button').live('click', function() {
		$(this).hide();
		$('#rsvp_form').slideToggle( 250, function() {
			$('html,body').scrollTop( $(document).height() );
		});
	});
	
	$('#ok_request').live('click', function() {
		$('#rsvp_form').html( $('#song_request_form').html() ).css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 2000);
		$('#song_request_form').remove();
		$('html,body').scrollTop( $(document).height() );
	});
	
	$('#nah_request').live('click', function() {
		stf = "<div class='attendance_message'>You RSVPed that you're attending<br>We're looking forward to seeing you <span class='emoti'>: )</span><br><a href='javascript:;' style='background: none; border: none;' id='changed_mind'>Changed your mind?</a></div>";
		stf += "<div id='rsvp_form' style='display: none;'>";
		stf += "<div id='rsvp_title'>RSVP:</div>"
		stf += "<a href='javascript:;' id='attending' class='attendance'>Attending</a> ";
		stf += "<a href='javascript:;' id='nattending' class='attendance'>Not Attending</a><br>";
		stf += "</div>";

		$(this).parent().parent().html( stf );

		$('html,body').scrollTop( $(document).height() );
		$('.attendance_message').css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 2000);
	});
	
	$('#sr_submit').live('click', function() {
		
		sr = {};
		sr.code = $('#rsvp_code').val();
		sr.song_request = 'Artist: '+$('input[type="text"][name="artist"]').val()+', Song: '+$('input[type="text"][name="song"]').val();
		
		$('#rsvp_form').html('<div style="text-align:center;"><img src="/img/loader.gif"></div>');
		
		$.post( '/update_sr.php', sr, function( data ) {
			$('.invite ul li.rsvp').html( data )
			$('#rsvp_form').css({backgroundColor: '#85a7bd', 'border-radius': '5px'}).animate({backgroundColor: 'rgba(178, 178, 178, 0.45)'}, 2000);
			$('html,body').scrollTop( $(document).height() );
		});
	});
	
	$('#address').live({
		mouseenter: function() {
			$(this).animate({backgroundColor: 'rgba(157, 182, 198, 0.5)'}, 500).css('box-shadow', '4px 4px 4px #808080');
		}, 
		mouseleave: function() {
			$(this).animate({backgroundColor: 'transparent'},500).css('box-shadow', '4px 4px 4px transparent');
		}
	});
	$('#address').live('click', function(){
		location.hash = '!/'+'where'
	});
});
