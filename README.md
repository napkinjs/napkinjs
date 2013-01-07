napkinjs
========

Multiplayer Wacom tablet fun!

Overview
--------

napkinjs is an experiment in using the Canvas and Wacom JavaScript APIs for
collaborative scribbling.

Installation
------------

For now, grab the code from git.

> $ git clone git://github.com/napkinjs/napkinjs.git  
> $ cd napkinjs  
> $ npm install  

napkinjs is written to work within a [seaport](https://github.com/substack/seaport)
cluster, fronted by a custom proxy. This behaviour can be safely removed though,
by modifying the server's `app.js` file. It also wants a redis server, so you'll
have to have one of them available.

Usage
-----

```
$ ./app.js
```

License
-------

3-clause BSD. A copy is included with the source.

Contributors
------------

* Conrad Pankoff ([deoxxa](http://github.com/deoxxa))
* Naomi Kyoto ([naomik](http://github.com/naomik))
