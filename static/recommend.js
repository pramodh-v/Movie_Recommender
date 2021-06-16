$(function(){
	$('.fail').css('display','none');
	var ip = document.getElementById('autoComplete');
	const disablebut = function(e){
		//console.log($('.movie'));
		if(e.target.value==""){							// Button is disabled when no input is given
			$('.movie-button').attr('disabled',true);
		}
		else{
			$('.movie-button').attr('disabled',false);	
		}
	} 
	ip.addEventListener('input',disablebut);
	$('.movie-button').on('click',function(){
		var api_key = keys.API_KEY;
		var movie_title = $('.movie').val();
		//console.log(movie_title);
		if (movie_title=="") {
      		$('.results').css('display','none');
      		$('.fail').css('display','block');
    	}
    	if (($('.fail').text() && ($('.footer').css('position') == 'absolute'))) {
      		$('.footer').css('position', 'fixed');
    	}
    	else{
      		load_movie_details(api_key,movie_title.toUpperCase());
    	}
	});
});
// When user clicks on recommended movie's card
function recommendedcard(e){
	$('#loader').fadeIn();
	var api_key = keys.API_KEY;
	var rec_title = e.getAttribute('title').toUpperCase();
	load_movie_details(api_key,rec_title)
}

function load_movie_details(api_key,movie_title){
	$.ajax({
		type: 'GET',
		url: 'https://api.themoviedb.org/3/search/movie?api_key='+api_key+'&query='+movie_title,
		async: false,	// To stop fetching details asynchronously
		success: function(movie){
			if(movie.results.length<1)	// If no movies are found
			{
				$('.results').css('display','none');
 	     		$('.fail').css('display','block');
 	     	    $("#loader").delay(500).fadeOut();	
			}
			else if(movie.results.length==1)
			{
				$("#loader").fadeIn();
       			$('.fail').css('display','none');
        		$('.results').delay(1000).css('display','block');
        		var movie_id = movie.results[0].id;
        		var movie_title = movie.results[0].title;
        		var movie_title_org = movie.results[0].original_title;
        		get_recommendations(movie_title,movie_id,api_key);
        		//get_movie_details(movie_id,api_key,movie_title,arr);
			}
			else
			{
				var closest = {}; // Find the movie closest to the given query(If the user enters the movie name with spelling errors). This is done by editdistance algorithm
				var flag=0;
				var movie_id = "";
        		var movie_title = "";
        		var movie_title_org = "";
        		$('#loader').fadeIn();
        		$('.fail').css('display','none');
        		$('.results').delay(1000).css('display','block');
        		for(var mov in movie.results)
        		{
        			if(movie_title==movie.results[mov].original_title){
        				flag=1;
        				var movie_id = movie.results[0].id;
        				var movie_title = movie.results[0].title;
        				var movie_title_org = movie.results[0].original_title;
        				break;
        			}
        			else{
        				closest[movie.results[mov].title] = simi(movie_title,movie.results[mov].title);
        			}
        		}
        		if(!flag)
        		{
        			movie_title = Object.keys(closest).reduce(function(a, b){ return closest[a] > closest[b] ? a : b }); // Maximum similarity between users query and movie db.
          			var index = Object.keys(closest).indexOf(movie_title)
          			movie_id = movie.results[index].id;
          			movie_title_org = movie.results[index].original_title;
        		}
        		get_recommendations(movie_title,movie_id,api_key);
        		//get_movie_details(movie_id,api_key,movie_title,arr);
			}
		},
		error: function(error){
			alert('Invalid Request: '+error.ResponseText);
			$('#loader').delay(500).fadeOut();
		},
	});
}
function simi(str1,str2){
	var s1 = str1,s2 = str2;
	if(str1.length>str2.length){
		s2 = str1,s1=str2;
	}
	var longer = s2.length;
	if(longer==0)
		return 1.0;
	return (longer - editDist(s2,s1))/parseFloat(longer);
}
// Finding Levenshtein Distance between two strings.This is almost the same algorithm used in google search(Did you mean?).
function editDist(s1,s2){
	s2 = s2.toLowerCase();
	s1 = s1.toLowerCase();
	var costs = new Array();
  	for (var i = 0; i <= s1.length; i++) {
    	var lastValue = i;
    	for (var j = 0; j <= s2.length; j++) {
     		if (i == 0)
        		costs[j] = j;
      		else {
        		if (j > 0) {
          			var newValue = costs[j - 1];
          			if (s1.charAt(i - 1) != s2.charAt(j - 1))
            			newValue = Math.min(Math.min(newValue, lastValue),costs[j]) + 1;
          				costs[j - 1] = lastValue;
          				lastValue = newValue;
        			}
      			}
    	}
    	if (i > 0)
      		costs[s2.length] = lastValue;
  	}
  	return costs[s2.length];
}
function get_movie_details(movie_id,api_key,movie_title,rec_arr)
{
	$.ajax({
		type: 'get',
		url: 'https://api.themoviedb.org/3/movie/'+movie_id+'?api_key='+api_key,
		success:function(movie_details){
			show_movie_details(movie_details,movie_title,api_key,movie_id,rec_arr);
		},
		error: function(error){
			alert('Invalid Request: '+error);
			$('#loader').delay(500).fadeOut();
		}
	})
}
function show_movie_details(movie_details,movie_title,api_key,movie_id,arr)
{
	var posterpath = "";
	if(movie_details.poster_path){
		posterpath = 'https://image.tmdb.org/t/p/original'+movie_details.poster_path;
	}
	else{
		posterpath = 'static/default.jpg';
	}
	var over = movie_details.overview;
	var genres = movie_details.genres;
	var rating = movie_details.vote_average;
	var vote_count = movie_details.vote_count;
	var release_date = movie_details.release_date;
	var runtime = movie_details.runtime;
	var status = movie_details.status;
	var genres_list = [];
	for(genre in genres){
		genres_list.push(genres[genre].name);
	}
	var genre = genres_list.join(', ');
		//console.log(movie_id);
    posters = [];
    for(mov in arr){
    	$.ajax({
    		type: 'get',
    		url: 'https://api.themoviedb.org/3/search/movie?api_key='+api_key+'&query='+arr[mov],
    		async: false,
    		success: function(movie){
    			//console.log(movie.results);
    			if(movie.total_results>0)
    				posters.push('https://image.tmdb.org/t/p/original'+movie.results[0].poster_path);
    			else
    				arr.splice(mov,1);
    		},
    		error: function(error){
    			console.log(error.responseText);
    		},
    	});
    }
    movie_cast = get_movie_cast(movie_id,api_key);
    ind_cast = get_individual_cast(movie_cast,api_key);
	console.log(movie_cast);
	console.log(ind_cast);
	console.log(arr);
	details = {
      'title':movie_title,
      'cast_ids':JSON.stringify(movie_cast.cast_ids),
      'cast_names':JSON.stringify(movie_cast.cast_names),
      'cast_chars':JSON.stringify(movie_cast.cast_chars),
      'cast_profiles':JSON.stringify(movie_cast.cast_profiles),
      'cast_bdays':JSON.stringify(ind_cast.cast_bdays),
      'cast_bios':JSON.stringify(ind_cast.cast_bios),
      'cast_pob':JSON.stringify(ind_cast.cast_pob),
      'imdb_id':movie_id,
      'poster':posterpath,
      'genres':genre,
      'overview':over,
      'rating':rating,
      'vote_count':vote_count.toLocaleString(),
      'rel_date':release_date,  
      'release_date':new Date(release_date).toDateString().split(' ').slice(1).join(' '),
      'runtime':runtime,
      'status':status,
      'rec_movies':JSON.stringify(arr),
      'rec_posters':JSON.stringify(posters),
  	}
  // posting movie details in an url
	$.ajax({
    	type:'POST',
    	data: details,
   	 	url:"/recommend",
    	dataType: 'html',
    	complete: function(){
      		$("#loader").delay(500).fadeOut();
    	},
    	success: function(response) {
      		$('.results').html(response);
      		$('#autoComplete').val('');
      		$('.footer').css('position','fixed');
      		if ($('.movie-content')) {
        		$('.movie-content').after('<div class="gototop"><i title="Go to Top" class="fa fa-arrow-up"></i></div>');
      		}
      		$(window).scrollTop(0);
    	}
  	});
}
function get_movie_cast(movie_id,api_key){
	ids = [];
	names = [];
	characters = [];
	pfp = [];
	cast_arr = [0,1,2,3,4,5,6,7,8,9];
	$.ajax({
		type: 'GET',
		url : 'https://api.themoviedb.org/3/movie/'+movie_id+'/credits?api_key='+api_key,
		async: false,
		success: function(ren_movie){
			if(ren_movie.cast.length>0)
			{
				if(ren_movie.cast.length<10)
					cast_arr = cast_arr.slice(0,5);
				for(var actor in cast_arr){
					ids.push(ren_movie.cast[actor].id);
					names.push(ren_movie.cast[actor].name);
					characters.push(ren_movie.cast[actor].character);
					if(ren_movie.cast[actor].profile_path){
						pfp.push('https://image.tmdb.org/t/p/original'+ren_movie.cast[actor].profile_path);
					}
					else
						pfp.push('static/defaultactor.jpg');
				}
			}
		},
		error: function(error){
			alert('Invalid Request: '+error);
			$("#loader").delay(500).fadeOut();
		},
	});
	return {cast_ids: ids,cast_names: names,cast_chars: characters,cast_profiles: pfp};
}
function get_individual_cast(movie_cast,api_key){
	cast_bdays = [];
	cast_bios = [];
	cast_pob = [];
	for(var id in movie_cast.cast_ids){
		$.ajax({
			type: 'GET',
			url: 'https://api.themoviedb.org/3/person/'+movie_cast.cast_ids[id]+'?api_key='+api_key,
			async: false,
			success: function(cast_details){
				cast_bdays.push(cast_details.birthday);
				if(cast_details.biography){
					cast_bios.push(cast_details.biography);
				}
				else{
					cast_bios.push('NA');
				}
				if(cast_details.place_of_birth){
					cast_pob.push(cast_details.place_of_birth);
				}
				else{
					cast_pob.push('NA');
				}
			}
		});
	}
	return {cast_bdays: cast_bdays,cast_bios: cast_bios,cast_pob: cast_pob};
}
function get_recommendations(movie_title,movie_id,api_key){
	$.ajax({
    type:'POST',
    url:"/similarity",
    data:{'name':movie_title},
    success: function(recs){
      if(recs=="Movie Not Found"){
        $('.fail').css('display','block');
        $('.results').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else {
        $('.fail').css('display','none');
        $('.results').css('display','block');
        var movie_arr = recs.split('-');
        var arr = [];
        for(const movie in movie_arr){
          arr.push(movie_arr[movie]);
        }
        get_movie_details(movie_id,api_key,movie_title,arr);
      }
    },
    error: function(error){
      alert(error);
      $("#loader").delay(500).fadeOut();
    },
  }); 
}