## FFmpeg filtergraph generator
A tool that allows you to create a filtergraph visually without having to remember the thousands of options available for each filter.

## How to use
Find the webpage at [https://angyongen.github.io/ffmpeg-filtergraph-generator]

## How to update filters
copy the text from [https://raw.githubusercontent.com/FFmpeg/FFmpeg/master/doc/filters.texi]
use tools.html to create a filter list json
prepend `var filterList=` to the json and put it inside filterlist1.js

