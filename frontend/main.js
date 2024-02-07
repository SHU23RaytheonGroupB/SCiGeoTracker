import './style.css'
import 'mapbox-gl/dist/mapbox-gl.css';

import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYzAwMTAyNTciLCJhIjoiY2xycWoyaTgwMDQ2cTJqbWJ3OTZzeTZodSJ9.25CKJPPhwDZ5b4MOalcLtw';

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/dark-v11', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9, // starting zoom
});
