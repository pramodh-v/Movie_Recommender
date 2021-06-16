import pandas as pd
import numpy as np
from flask import Flask,render_template,request
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

def create_sim_mat():
	dataset = pd.read_csv('Final_Movie_Data.csv')
	cv = CountVectorizer()
	c_m = cv.fit_transform(dataset['combined'])
	sim = cosine_similarity(c_m)
	return dataset,sim

def recom(movie):
	try:
		dataset.head()
		sim.shape
	except:
		dataset,sim = create_sim_mat()
	if movie not in dataset['movie_title'].unique():
		return('Movie not found')
	else:
		index = dataset.loc[dataset['movie_title']==movie].index[0] # Getting Index of Title
		similar = list(enumerate(sim[index])) # Converting similar movies into a list
		similar = sorted(similar,key= lambda x:x[1],reverse=True) # Sorting Values in Descending Order
		similar = similar[1:11] # Drop The Movie title which has sim score of 1.
		similar_movie = []
		for i in range(len(similar)):
			similar_movie.append(dataset['movie_title'][similar[i][0]])
		return similar_movie

def get_movies():
	dataset = pd.read_csv('Final_Movie_Data.csv')
	return(dataset['movie_title'].str.capitalize())

# Converting ["['Inception','The Prestige','Gravity']"] to ['Inception','The Prestige','Gravity'] as the data fetched from post method will be a string.
def to_list(List):
    List = List.split('","')
    List[0] = List[0].replace('["','')
    List[-1] = List[-1].replace('"]','')
    return List

app = Flask(__name__)

@app.route('/')
@app.route('/home')
def hello():
	suggestions = get_movies()
	suggestions = suggestions.to_json()
	return render_template('main.html',suggestions=suggestions)

@app.route('/similarity',methods = ['POST'])
def similar_movies():
	movie_title = request.form['name']
	recommended = recom(movie_title)
	# Send recommended movies
	if type(recommended)==type('string'):
		return recommended
	else:
		return '-'.join(recommended)

@app.route('/recommend',methods = ['POST'])
def mov_details():
	movie_title = request.form['title']
	cast_ids = request.form['cast_ids']
	cast_names = request.form['cast_names']
	cast_chars = request.form['cast_chars']
	cast_profiles = request.form['cast_profiles']
	cast_bdays = request.form['cast_bdays']
	cast_bios = request.form['cast_bios']
	cast_pob = request.form['cast_pob']
	imdb_id = request.form['imdb_id']
	poster =  request.form['poster']
	genres =  request.form['genres']
	overview = request.form['overview']
	rating =  request.form['rating']
	vote_count = request.form['vote_count']
	release_date = request.form['rel_date']
	runtime = request.form['runtime']
	status = request.form['status']
	recommended_movies =  request.form['rec_movies']
	rec_posters = request.form['rec_posters']
	suggestions = get_movies()
	rec_movies = to_list(recommended_movies)
	rec_posters = to_list(rec_posters)
	cast_names = to_list(cast_names)
	cast_chars = to_list(cast_chars)
	cast_profiles = to_list(cast_profiles)
	cast_bdays = to_list(cast_bdays)
	cast_bios = to_list(cast_bios)
	cast_pob = to_list(cast_pob)
	print(rec_movies)
	print(rec_posters)
	for bio in cast_bios:
		bio = bio.replace(r'\n','\n')
		bio = bio.replace(r'\"','\"')
	movie_cards = {rec_posters[i]: rec_movies[i] for i in range(len(rec_posters))}
	casts = {cast_names[i]:[cast_ids[i], cast_chars[i], cast_profiles[i]] for i in range(len(cast_profiles))}
	cast_details = {cast_names[i]:[cast_ids[i],cast_profiles[i],cast_bdays[i],cast_pob[i],cast_bios[i]] for i in range(len(cast_pob))}
	return render_template('recommend.html',title=movie_title,poster=poster,overview=overview,vote_average=rating,
        vote_count=vote_count,release_date=release_date,runtime=runtime,status=status,genres=genres,movie_cards = movie_cards,casts=casts,cast_details=cast_details)
if __name__=='__main__':
	app.run(debug=True)