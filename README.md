# Jupyter-Extensions
Collection of Jupyter Extensions

There are three types of extensions:
- nbextension
- server extension
- combined extension

Nbextensions are front-end extensions written in Javascript and CSS. They customize the notebook view and can be used to hide cells, add buttons or toolbars etc.

Server extensions are back-end extensions written in Python using the tornado framework and expose a RESTful API using handlers.

Combined extensions consist of an nbextension together with a server extension (e.g. press a button to call a service).
