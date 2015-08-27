## This is Jerry's Neighborhood Map Project

This project uses the Google Maps API to draw the map of my neighborhood and markers for some of my favorite places to go to. I also use the Yelp API to pull the address information, phone number and rating information for the selected location.

A search field is provided so you can easily filter for the specific location you're interested in. You don't have to press enter as I use KnockoutJS's dual binding to automatically detect changes to the search field and automatically filter locations that match. Notice that only the markers for locations that match will show on the map.

You can click on the location on the left, or the marker on the map directly to display Yelp information about the location. Notice that the marker uses the bounce animation when it's selected.
