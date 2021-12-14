$(function() {
		$('#ohm-menu-button-hover').hover(function() {
			$('.second_nav').css('position', 'absolute').show()
		}, function() {
			$('.second_nav').hide();
		})
		$('.content').eq(0).show();
		$('#hamburger').click(function() {
			if($(this).attr('data-flag')=='false'){
				$(this).attr('data-flag','true')
				$('.MuiDrawer-paper').css({
					'left': '0px',
				})
				$('.MuiBackdrop-root').show();
			}
		})
		
		$('.MuiBackdrop-root').click(function(){
			$('#hamburger').attr('data-flag','false')
			$('.MuiDrawer-paper').css({
				'left': '-300px',
			})
			$('.MuiBackdrop-root').hide();
		})
		
		$('.sfq_click').click(function(){
			$('.sfq_second').hide();
			$(this).siblings('.sfq_second').toggle();
		})
		
		
		$('.tabs_ul li').click(function(){
			var index=$(this).index();
			$('.tabs_ul li').removeClass('active').eq(index).addClass('active');
			$('.content').hide().eq(index).show();
		})
		
		
	}
)